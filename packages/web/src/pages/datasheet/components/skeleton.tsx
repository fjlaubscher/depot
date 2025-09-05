import React from 'react';
import AppLayout from '@/components/layout';
import { PageHeaderSkeleton, TabsSkeleton, SkeletonCard } from '@/components/ui';

const Skeleton: React.FC = () => {
  return (
    <AppLayout title="Datasheet">
      <div className="flex flex-col gap-4" data-testid="datasheet-loader">
        <PageHeaderSkeleton />

        {/* Points Stats Skeleton */}
        <div className="flex justify-end">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>

        <TabsSkeleton tabCount={2} />

        {/* Datasheet content skeleton */}
        <div className="space-y-6">
          <SkeletonCard />
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Skeleton;
