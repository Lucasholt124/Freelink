import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-6 text-center">
      <div className="text-8xl font-black text-slate-200 dark:text-slate-700 mb-4 select-none">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
        Página não encontrada
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
        A página que você está procurando não existe ou foi removida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
