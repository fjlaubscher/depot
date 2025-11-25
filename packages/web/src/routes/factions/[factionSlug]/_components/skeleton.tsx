import React from 'react';
import AppLayout from '@/components/layout';
import { PageHeaderSkeleton, TabsSkeleton, SkeletonCard } from '@/components/ui';

const LoadingSkeleton: React.FC = () => {
  return (
    <AppLayout title="Loading Faction">
      <div className="flex flex-col gap-4">
        <PageHeaderSkeleton />
        <TabsSkeleton tabCount={2} />

        {/* Content skeleton - simulate datasheet cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default LoadingSkeleton;
