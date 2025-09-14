import { Skeleton } from "./ui/skeleton";



function SkeletonDashboard() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
          <div className="mb-8 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border bg-gray-100 border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border bg-gray-100 border-gray-200">
              <Skeleton className="h-4 w-36 mb-4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="p-6 rounded-2xl border bg-gray-100 border-gray-200">
              <Skeleton className="h-4 w-40 mb-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonDashboard;