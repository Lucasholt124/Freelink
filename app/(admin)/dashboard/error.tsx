'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    try {
      console.error('[Dashboard Error]', error)
    } catch {
      // Silently ignore logging errors
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Erro ao carregar
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { try { reset() } catch { window.location.reload() } }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Painel
          </Link>
        </div>
      </div>
    </div>
  )
}
