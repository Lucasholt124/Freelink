// Em app/r/[slug]/page.tsx
// (Substitua o arquivo inteiro por esta versão)

import { notFound, redirect } from 'next/navigation';

import { api } from '@/convex/_generated/api';
// Usamos 'fetchMutation' para Server Components quando a função modifica dados (como incrementar cliques).
import { fetchMutation } from 'convex/nextjs';

// =======================================================
// CORREÇÃO APLICADA AQUI
// =======================================================
// A tipagem agora informa ao Next.js que esperamos `params` como uma Promise,
// o que satisfaz o processo de build da Vercel.
interface ShortLinkRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {

  // Resolvemos a Promise ANTES de tentar acessar `slug`.
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (!slug) {
    return notFound();
  }

  try {
    // Sua lógica de chamar `getAndIncrement` já está perfeita e é a mais eficiente.
    const originalUrl = await fetchMutation(api.shortLinks.getAndIncrement, { slug });

    if (!originalUrl) {
      // Se a mutation retornar null, significa que a slug não existe no banco.
      return notFound();
    }

    // Se a URL for encontrada, redirecionamos o usuário.
    // Usar 'redirect' é a maneira correta em Server Components.
    return redirect(originalUrl);

  } catch (error) {
    console.error(`Erro ao redirecionar a slug "${slug}":`, error);
    // Em caso de qualquer erro no backend, a opção mais segura é mostrar uma página 404.
    return notFound();
  }
}