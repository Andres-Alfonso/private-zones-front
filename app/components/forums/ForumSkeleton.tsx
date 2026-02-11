// app/components/forums/ForumSkeleton.tsx

export default function ForumSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="bg-white/80 rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Reactions skeleton */}
          <div className="bg-white/80 rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-xl w-32"></div>
              ))}
            </div>
          </div>

          {/* Comments skeleton */}
          <div className="bg-white/80 rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}