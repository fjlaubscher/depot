import React from 'react';
import AppLayout from '@/components/layout';
import { PageHeaderSkeleton, Skeleton, SkeletonCard } from '@/components/ui';

const LoadingSkeleton: React.FC = () => {
  return (
    <AppLayout title="Loading Faction">
      <div className="flex flex-col gap-4">
        <PageHeaderSkeleton />
        <div className="border-b border-border-subtle">
          <nav className="-mb-px flex gap-4">
            {[0, 1].map((index) => (
              <div key={index} className="py-4 px-1 border-b-2 border-transparent">
                <Skeleton height={20} width={80} />
              </div>
            ))}
          </nav>
        </div>

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
