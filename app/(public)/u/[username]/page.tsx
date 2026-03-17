import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import PublicPageContent from "@/components/PublicPageContent";
import { getUserSubscriptionPlanByUsername } from "@/lib/subscription";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Metadata } from "next";


export const revalidate = 60;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { username } = await params;


  const customizations = await fetchQuery(api.lib.customizations.getCustomizationsBySlug, { slug: username });


  const defaultImage = "https://freelinnk.com/og-image-default.png";

  const title = `@${username} | Freelinnk`;
  const description = customizations?.description || `Confira os links oficiais de @${username} no Freelinnk.`;
  const image = customizations?.profilePictureUrl || defaultImage;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [image],
      type: 'profile',
      username: username,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [image],
    },
  };
}

export default async function PublicLinkInBioPage({ params }: PageProps) {
  try {
    const { username } = await params;

    if (!username || typeof username !== 'string' || username.length < 2 || username.length > 50) {
      notFound();
    }


    const [
      preloadedLinks,
      preloadedCustomizations,
      subscriptionPlan,
      trackingIds,
    ] = await Promise.all([
      preloadQuery(api.lib.links.getLinksBySlug, { slug: username }),
      preloadQuery(api.lib.customizations.getCustomizationsBySlug, { slug: username }),
      getUserSubscriptionPlanByUsername(username),
      fetchQuery(api.tracking.getIdsBySlug, { slug: username }),
    ]);

    if (!preloadedCustomizations) {
      notFound();
    }

    return (
      <>
        {/* Scripts de Tracking (Google/Facebook) */}
        {trackingIds?.googleAnalyticsId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${trackingIds.googleAnalyticsId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${trackingIds.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}

        {/* ... Resto dos scripts de pixel ... */}
        {trackingIds?.facebookPixelId && (
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${trackingIds.facebookPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        <PublicPageContent
          username={username}
          preloadedLinks={preloadedLinks}
          preloadedCustomizations={preloadedCustomizations}
          plan={subscriptionPlan.plan}
        />
      </>
    );
  } catch (error) {
    console.error("❌ Erro ao carregar página:", error);
    notFound();
  }
}