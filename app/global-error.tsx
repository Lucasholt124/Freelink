'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    try {
      console.error('[Global Error]', error)
    } catch {
      // Silently ignore logging errors
    }
  }, [error])

  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
            Ocorreu um erro inesperado. Tente novamente ou atualize a página.
          </p>
          <button
            onClick={() => { try { reset() } catch { window.location.reload() } }}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
