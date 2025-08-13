// Em /app/r/[slug]/page.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ShortLinkRedirectPage() {
  const params = useParams();
  // `params.slug` pode ser um array, então pegamos o primeiro elemento
   const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

   useEffect(() => {
    if (slug) {
      // Esta URL agora corresponde ao que a nossa API espera
      window.location.href = `/api/redirect?slug=${encodeURIComponent(slug)}`;
    }
  }, [slug]);

  return (
    // Página de carregamento simples enquanto o redirecionamento acontece.
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        height: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#f9fafb',
        color: '#4b5563'
    }}>
      <p>Redirecionando...</p>
      {/* Spinner SVG para um feedback visual melhor */}
      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
}