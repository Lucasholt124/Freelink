export default function ProfileLoading() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-10 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 mb-4" />
      {/* Name skeleton */}
      <div className="w-40 h-5 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
      {/* Bio skeleton */}
      <div className="w-64 h-4 bg-slate-200 dark:bg-slate-700 rounded-full mb-1" />
      <div className="w-48 h-4 bg-slate-200 dark:bg-slate-700 rounded-full mb-8" />
      {/* Link button skeletons */}
      <div className="w-full max-w-md space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl"
          />
        ))}
      </div>
    </div>
  )
}
