import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Greeting & Recent 6 Grid */}
      <div>
        <Skeleton className="h-9 w-52 rounded-xl mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-card/60 p-2 rounded-xl border border-border/40">
              <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1 min-w-0 pr-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div>
        <Skeleton className="h-7 w-36 rounded-lg mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card/60 p-3.5 rounded-2xl border border-border/40 space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5 rounded" />
              <Skeleton className="h-3 w-3/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Genre Section */}
      <div>
        <Skeleton className="h-7 w-44 rounded-lg mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card/60 p-3.5 rounded-2xl border border-border/40 space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SongTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[16px_4fr_3fr_minmax(0,1fr)_60px] items-center gap-4 px-4 py-2.5 rounded-xl border border-transparent"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-4 w-4 rounded-full ml-auto" />
          <Skeleton className="h-3.5 w-10 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function PlaylistSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Header Banner Skeleton */}
      <div className="p-6 pb-10 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent border-b border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <Skeleton className="h-44 w-44 rounded-2xl shrink-0 shadow-lg" />
          <div className="space-y-3 flex-1 min-w-0">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-10 w-64 sm:w-80 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        </div>
      </div>

      {/* Action Controls & Song Rows */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full shadow-md" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <SongTableSkeleton rows={8} />
      </div>
    </div>
  );
}

export function LibrarySkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-72 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-card/60 p-3.5 rounded-2xl border border-border/40 space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-44 rounded-xl" />
      </div>
      <HomeSkeleton />
    </div>
  );
}

