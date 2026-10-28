import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/layout';
import { SkeletonCard, PageHeaderSkeleton } from '@/components/ui/skeleton';

const LoadingSkeleton: React.FC = () => {
  const { t } = useTranslation('catalog');
  return (
    <AppLayout title={t('factions')}>
      <div className="flex flex-col gap-4">
        <PageHeaderSkeleton />

        {/* Search/Filters skeleton */}
        <div className="h-12 bg-surface-soft rounded-sm animate-pulse" />

        <div className="flex flex-col gap-8">
          {Array.from({ length: 3 }).map((_, allianceIndex) => (
            <div key={`skeleton-alliance-${allianceIndex}`} className="flex flex-col gap-4">
              <div className="h-6 bg-surface-soft rounded-xs w-24 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, cardIndex) => (
                  <SkeletonCard key={`skeleton-card-${allianceIndex}-${cardIndex}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default LoadingSkeleton;
