// Em app/r/[slug]/page.tsx
// (Substitua o arquivo inteiro por esta versão final e à prova de build)

import { notFound, redirect } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { headers } from 'next/headers';


interface ShortLinkRedirectPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {

  // =======================================================
  // CORREÇÃO APLICADA AQUI: Lógica Agnóstica
  // =======================================================
  // Verificamos se 'params' é uma Promise. Se for, esperamos por ela.
  // Se for um objeto, usamos diretamente.
  const resolvedParams = (params instanceof Promise) ? await params : params;
  const { slug } = resolvedParams;

  if (!slug) {
    return notFound();
  }


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