"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ShortLinkRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `params.slug` pode ser um array, então pegamos o primeiro elemento
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    async function handleRedirect() {
      if (!slug) {
        setError("Link inválido");
        setIsLoading(false);
        return;
      }

      try {
        // Redireciona para nossa API de redirecionamento
        window.location.href = `/api/redirect?slug=${encodeURIComponent(slug)}`;
      } catch (err) {
        console.error("Erro ao redirecionar:", err);
        setError("Ocorreu um erro ao redirecionar para o destino.");
        setIsLoading(false);
      }
    }

    // Pequeno timeout para garantir que os rastreadores carreguem
    const timer = setTimeout(() => {
      handleRedirect();
    }, 100);

    return () => clearTimeout(timer);
  }, [slug, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Voltar à Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="space-y-6 text-center">
        <div className="relative mx-auto">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Redirecionando...</h1>
          <p className="text-gray-500 mt-2">Você será redirecionado automaticamente.</p>
        </div>
      </div>
    </div>
  );
}