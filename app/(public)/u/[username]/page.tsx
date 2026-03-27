import { cache } from "react";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import PublicPageContent from "@/components/PublicPageContent";
import { getUserSubscriptionPlanByUsername } from "@/lib/subscription";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 60;
export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Cache das customizações para evitar chamada duplicada entre generateMetadata e page
const getCachedCustomizations = cache(async (username: string) => {
  return fetchQuery(api.lib.customizations.getCustomizationsBySlug, { slug: username });
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const customizations = await getCachedCustomizations(username);

  const defaultImage = "https://freelinnk.com/og-image-default.png";
  const title = `@${username} | Freelinnk`;
  const description = customizations?.description || `Confira os links oficiais de @${username} no Freelinnk.`;
  const image = customizations?.profilePictureUrl || defaultImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "profile",
      username,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicLinkInBioPage({ params }: PageProps) {
  const { username } = await params;

  if (!username || typeof username !== "string" || username.length < 2 || username.length > 50) {
    notFound();
  }

  // 🧠 Busca o nicho do dono da página (LEITURA PURA, SEM IA)
  // O nicho já foi classificado e salvo quando o usuário criou/editou o username
  const [preloadedLinks, preloadedCustomizations, subscriptionPlan, trackingIds, pageOwnerData] =
    await Promise.all([
      preloadQuery(api.lib.links.getLinksBySlug, { slug: username }),
      preloadQuery(api.lib.customizations.getCustomizationsBySlug, { slug: username }),
      getUserSubscriptionPlanByUsername(username),
      fetchQuery(api.tracking.getIdsBySlug, { slug: username }),
      fetchQuery(api.ads.getPageOwnerNiche, { username: username }),
    ]);

  if (!preloadedCustomizations) {
    notFound();
  }

  return (
    <>
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
      try {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${trackingIds.googleAnalyticsId}');
      } catch(e) {}
    `,
            }}
          />
        </>
      )}


      <PublicPageContent
        username={username}
        preloadedLinks={preloadedLinks}
        preloadedCustomizations={preloadedCustomizations}
        plan={subscriptionPlan.plan}
        pageOwnerNiche={pageOwnerData?.niche || "geral"}
      />
    </>
  );
}