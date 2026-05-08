export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>

        {/* Content skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>

        {/* Button skeleton */}
        <div className="flex gap-2 pt-4">
          <div className="h-9 bg-gray-200 rounded w-24"></div>
          <div className="h-9 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
