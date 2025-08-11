// Em /app/r/[slug]/page.tsx
// (Substitua o arquivo inteiro por esta versão definitiva)

import { notFound, redirect } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { headers } from 'next/headers';

// =======================================================
// CORREÇÃO DEFINITIVA: Usando a tipagem que a Vercel exige
// =======================================================
interface ShortLinkRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {

  // 1. Resolvemos a Promise dos params primeiro
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (!slug) {
    return notFound();
  }

  // 2. Acessamos os headers de forma síncrona
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') ?? undefined;
  const referrer = headerList.get('referer') ?? undefined;

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

    // `redirect` deve ser a última instrução a ser executada.
    redirect(originalUrl);

  } catch (error) {
    console.error(`Erro ao redirecionar a slug "${slug}":`, error);
    return notFound();
  }
}