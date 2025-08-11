// app/r/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { headers } from "next/headers";

interface ShortLinkRedirectPageProps {
  params: { slug: string };
}

export default async function ShortLinkRedirectPage({
  params,
}: ShortLinkRedirectPageProps) {
  const { slug } = params;

  if (!slug) {
    return notFound();
  }

  // headers() já retorna Headers, não precisa de await
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? undefined;
  const referrer = headerList.get("referer") ?? undefined;

  const visitorId = "anonymous_visitor";

  try {
    const originalUrl: string | null = await fetchAction(
      api.shortLinks.getAndRegisterClick,
      {
        slug,
        visitorId,
        userAgent,
        referrer,
      }
    );

    if (!originalUrl) {
      return notFound();
    }

    return redirect(originalUrl);
  } catch (error) {
    console.error(`Erro ao redirecionar a slug "${slug}":`, error);
    return notFound();
  }
}
