import React from 'react';
import Layout from '@/components/ui/layout';
import { SkeletonCard } from '@/components/ui/skeleton';

const LoadingSkeleton: React.FC = () => {
  return (
    <Layout title="Home">
      <div className="space-y-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, allianceIndex) => (
            <div key={`skeleton-alliance-${allianceIndex}`}>
              <div className="mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              </div>
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
