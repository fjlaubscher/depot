import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

const DatasheetBrowserSkeleton = () => {
  return (
    <div className="flex flex-col gap-4" data-testid="datasheet-browser-skeleton">
      <Skeleton height={44} className="rounded-lg" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} width={120} height={32} className="rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} className="h-32" />
        ))}
      </div>
    </div>
  );
};

export default DatasheetBrowserSkeleton;
