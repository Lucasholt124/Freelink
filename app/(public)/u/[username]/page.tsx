import { cache } from "react";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import PublicPageContent from "@/components/PublicPageContent";
import { getUserSubscriptionPlanByUsername } from "@/lib/subscription";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ username: string }>;
}
const getCachedCustomizations = cache(async (username: string) =>
  fetchQuery(api.lib.customizations.getCustomizationsBySlug, {
    slug: username,
  }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const customizations = await getCachedCustomizations(username);
  const title = customizations?.displayName?.trim() || `@${username}`;
  const description =
    customizations?.description ||
    `Confira os links de @${username} no Freelinnk.`;
  const image = customizations?.profilePictureUrl || "/og-image-default.png";
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
  if (
    !username ||
    typeof username !== "string" ||
    username.length < 2 ||
    username.length > 50
  )
    notFound();
  // Legacy profiles may have links and a username without a customization record.
  const ownerId = await fetchQuery(api.lib.usernames.getUserIdBySlug, {
    slug: username,
  });
  if (!ownerId) notFound();
  const [
    preloadedLinks,
    preloadedCustomizations,
    subscriptionPlan,
    pageOwnerData,
  ] = await Promise.all([
    preloadQuery(api.lib.links.getLinksBySlug, { slug: username }),
    preloadQuery(api.lib.customizations.getCustomizationsBySlug, {
      slug: username,
    }),
    getUserSubscriptionPlanByUsername(username),
    fetchQuery(api.ads.getPageOwnerNiche, { username }),
  ]);
  // Tracking scripts are handled once by PublicPageContent after the visitor's choice.
  return (
    <PublicPageContent
      username={username}
      preloadedLinks={preloadedLinks}
      preloadedCustomizations={preloadedCustomizations}
      plan={subscriptionPlan.plan}
      pageOwnerNiche={pageOwnerData?.niche || "geral"}
    />
  );
}
