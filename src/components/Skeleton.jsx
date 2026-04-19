function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl p-5">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCharts() {
  return (
    <div className="col-span-2 flex flex-col gap-6">
      <div className="border border-gray-200 rounded-2xl p-6">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="border border-gray-200 rounded-2xl p-6">
        <Skeleton className="h-4 w-36 mb-4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonLogList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pb-3 border-b border-gray-100 last:border-0">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-3 w-40 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPostCards({ count = 3 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-5/6 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProductGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-5/6 mb-3" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonBookingList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-l-2 border-gray-200 pl-3">
          <Skeleton className="h-4 w-36 mb-1.5" />
          <Skeleton className="h-3 w-24 mb-1" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
