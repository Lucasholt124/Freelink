// Em app/r/[slug]/page.tsx

import { notFound, redirect } from 'next/navigation';

import { api } from '@/convex/_generated/api';
import { fetchMutation } from 'convex/nextjs';

// Esta página é um Server Component, otimizada para buscar dados e redirecionar.
export default async function ShortLinkRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  if (!slug) {
    notFound(); // Se não houver slug, mostra a página 404
  }

  // Criamos uma nova mutation no Convex para esta tarefa específica
  // Ela busca o link e incrementa o clique em uma única operação atômica.
  try {
    const originalUrl = await fetchMutation(api.shortLinks.getAndIncrement, { slug });

    if (!originalUrl) {
      // Se a mutation retornar null, significa que o slug não foi encontrado.
      notFound();
    }

    // Se encontrou, redireciona o usuário para o destino final.
    redirect(originalUrl);

  } catch (error) {
    console.error("Erro ao redirecionar link:", error);
    notFound(); // Em caso de qualquer erro, é mais seguro mostrar 404.
  }
}