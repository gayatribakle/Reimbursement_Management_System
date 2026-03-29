export function StatSkeleton() {
  return (
    <div className="card-elevated animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-surface-container-highest" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-surface-container-highest rounded w-20" />
          <div className="h-7 bg-surface-container-highest rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-container-highest rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 bg-surface-container-high rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-elevated space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-surface-container-highest rounded w-24" />
              <div className="h-2 bg-surface-container-high rounded w-16" />
            </div>
          </div>
          <div className="h-4 bg-surface-container-highest rounded w-full" />
          <div className="h-3 bg-surface-container-high rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-surface-container-highest rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <div className="card-elevated space-y-4">
        <div className="h-6 bg-surface-container-highest rounded w-40" />
        <TableSkeleton />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'page' }) {
  switch (type) {
    case 'stat':
      return <StatSkeleton />;
    case 'table':
      return <TableSkeleton />;
    case 'card':
      return <CardSkeleton />;
    case 'page':
    default:
      return <PageSkeleton />;
  }
}
