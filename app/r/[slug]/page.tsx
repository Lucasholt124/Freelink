// Em /app/r/[slug]/page.tsx
// (Substitua o arquivo inteiro)

import { notFound, redirect } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { headers } from 'next/headers';

// =======================================================
// CORREÇÃO DEFINITIVA
// =======================================================
// Esta linha força a página a ser renderizada dinamicamente a cada requisição.
// Isso garante que a função `headers()` esteja sempre disponível e resolve os
// erros de tipo e de build relacionados a ela.
export const dynamic = 'force-dynamic';

// A tipagem de 'params' como objeto simples é a mais comum e correta
// quando a página é forçada a ser dinâmica.
interface ShortLinkRedirectPageProps {
  params: { slug: string };
}

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {
  const { slug } = params;
  if (!slug) {
    return notFound();
  }

  // Com `force-dynamic`, a função `headers()` funcionará sem erros de tipo.
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

    // `redirect` precisa ser a última coisa a ser chamada.
    redirect(originalUrl);

  } catch (error) {
    console.error(`Erro ao redirecionar a slug "${slug}":`, error);
    return notFound();
  }
}