// Em app/u/[username]/page.tsx
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import PublicPageContent from "@/components/PublicPageContent";
import { getUserSubscriptionPlanByUsername } from "@/lib/subscription";
import Script from "next/script";
import { notFound } from "next/navigation";

export default async function PublicLinkInBioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  try {
    // Resolvemos a Promise para obter o username
    const { username } = await params;

    // Validamos se o username parece legítimo
    if (!username || typeof username !== 'string' || username.length < 2) {
      notFound();
    }

    // Carregamos todos os dados necessários em paralelo
    const [
      preloadedLinks,
      preloadedCustomizations,
      subscriptionPlan,
      trackingIds,
    ] = await Promise.all([
      preloadQuery(api.lib.links.getLinksBySlug, { slug: username }),
      preloadQuery(api.lib.customizations.getCustomizationsBySlug, { slug: username }),
      getUserSubscriptionPlanByUsername(username),
      // Corrigido: usamos fetchQuery corretamente
      fetchQuery(api.tracking.getIdsBySlug, { slug: username }),
    ]);

    // Verificamos se o usuário existe
    const hasValidData = preloadedCustomizations !== null;
    if (!hasValidData) {
      notFound();
    }

    return (
      <>
        {/* Scripts de rastreamento inseridos diretamente */}
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
    console.error("Erro ao carregar página de usuário:", error);
    notFound();
  }
}