'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    try {
      console.warn('[Profile Error]', error)
    } catch {
      // Silently ignore
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Perfil indisponível</h1>
      <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
        Não foi possível carregar este perfil. Tente novamente.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => { try { reset() } catch { window.location.reload() } }}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Tentar novamente
        </button>
        <Link href="/" className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">
          Início
        </Link>
      </div>
    </div>
  )
}
