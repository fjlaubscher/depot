import React from 'react';
import Layout from '@/components/ui/layout';
import { SkeletonCard, PageHeaderSkeleton } from '@/components/ui/skeleton';

const LoadingSkeleton: React.FC = () => {
  return (
    <Layout title="Home">
      <div className="flex flex-col gap-4">
        <PageHeaderSkeleton />

        {/* Search/Filters skeleton */}
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

        <div className="flex flex-col gap-8">
          {Array.from({ length: 3 }).map((_, allianceIndex) => (
            <div key={`skeleton-alliance-${allianceIndex}`} className="flex flex-col gap-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, cardIndex) => (
                  <SkeletonCard key={`skeleton-card-${allianceIndex}-${cardIndex}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default LoadingSkeleton;
