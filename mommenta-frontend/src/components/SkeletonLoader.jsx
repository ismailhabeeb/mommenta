export default function SkeletonLoader() {
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-6 w-1/3"></div>

      {/* Post skeletons */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
