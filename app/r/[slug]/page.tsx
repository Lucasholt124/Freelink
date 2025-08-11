import { notFound, redirect } from "next/navigation";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { headers } from "next/headers";

interface ShortLinkRedirectPageProps {
  params: { slug: string };
}

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {
  const { slug } = params;
  if (!slug) {
    return notFound();
  }

  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? undefined;
  const referrer = headerList.get("referer") ?? undefined;

  const visitorId = "anonymous_visitor";

  try {
    const originalUrl = await fetchAction(api.shortLinks.getAndRegisterClick, {
      slug,
      visitorId,
      userAgent,
      referrer,
    });

    if (!originalUrl) {
      return notFound();
    }

    return redirect(originalUrl);
  } catch (error) {
    console.error(`Erro ao redirecionar a slug "${slug}":`, error);
    return notFound();
  }
}
