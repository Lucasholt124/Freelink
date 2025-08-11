// Em app/r/[slug]/page.tsx
// (Substitua o arquivo inteiro por esta versão final)

import { notFound, redirect } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { headers } from 'next/headers';

// =======================================================
// CORREÇÃO DEFINITIVA: Voltando à tipagem de Promise
// =======================================================
// Damos ao build da Vercel exatamente o que ele está exigindo para esta rota.
interface ShortLinkRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {

  // =======================================================
  // CORREÇÃO DEFINITIVA: Usando 'await'
  // =======================================================
  // Resolvemos a Promise para acessar a propriedade 'slug'.
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (!slug) {
    return notFound();
  }

  // A lógica de `headers` e `fetchAction` já está correta.
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

    return redirect(originalUrl);
  } catch (error) {
    console.error(`Erro ao redirecionar a slug "${slug}":`, error);
    return notFound();
  }
}