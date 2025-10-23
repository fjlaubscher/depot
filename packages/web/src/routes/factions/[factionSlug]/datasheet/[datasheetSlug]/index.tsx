import type { FC } from 'react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';

// components
import AppLayout from '@/components/layout';
import { PageHeader, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton } from '@/components/shared';

// hooks
import useFaction from '@/hooks/use-faction';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useAppContext } from '@/contexts/app/use-app-context';

// page components
import DatasheetProfile from './_components/datasheet-profile';
import Skeleton from './_components/skeleton';

const DatasheetPage: FC = () => {
  const { factionSlug, datasheetSlug } = useParams<{
    factionSlug: string;
    datasheetSlug: string;
  }>();
  const { showToast } = useToast();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { state } = useAppContext();
  const settings = state.settings;

  const datasheet = useMemo(() => {
    if (faction && datasheetSlug) {
      return faction.datasheets.find((ds) => ds.slug === datasheetSlug || ds.id === datasheetSlug);
    }
    return undefined;
  }, [faction, datasheetSlug]);

  const datasheetCost = useMemo(() => {
    if (datasheet) {
      return datasheet.modelCosts.reduce((acc, curr) => {
        const formattedCost = `${curr.cost} pts (${curr.description})`;
        return acc ? `${acc} • ${formattedCost}` : formattedCost;
      }, '');
    }

    return undefined;
  }, [datasheet]);

  const handleShare = () => {
    const url = window.location.href;
    // @ts-ignore - Web Share API types not available in TypeScript lib
    if (navigator.share) {
      // @ts-ignore - Web Share API types not available in TypeScript lib
      navigator
        .share({
          title: datasheet?.name || 'Datasheet',
          url: url
        })
        .catch(() => {
          // Fallback to clipboard
          navigator.clipboard.writeText(url);
          showToast({ type: 'info', title: 'Success', message: 'Link copied to clipboard' });
        });
    } else {
      navigator.clipboard.writeText(url);
      showToast({ type: 'info', title: 'Success', message: 'Link copied to clipboard' });
    }
  };

  if (error) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Datasheet"
          message="We encountered an error while trying to load this datasheet. This could be due to network issues or the datasheet may not exist."
          stackTrace={error}
          data-testid="datasheet-error"
        />
      </AppLayout>
    );
  }

  if (loading || !faction) {
    return <Skeleton />;
  }

  if (!datasheet) {
    return (
      <AppLayout title="Not Found">
        <ErrorState
          title="Datasheet not found"
          message="The datasheet you're looking for doesn't exist or may have been removed."
          showRetry={false}
          homeUrl={factionSlug ? `/faction/${factionSlug}` : '/'}
          data-testid="datasheet-not-found"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Datasheet">
      <div className="flex flex-col gap-4">
        <BackButton
          to={`/faction/${faction.slug}`}
          label={faction.name}
          ariaLabel={`Back to ${faction.name}`}
          className="md:hidden"
        />

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Factions', path: '/factions' },
              { label: faction.name, path: `/faction/${faction.slug}` },
              {
                label: datasheet.name,
                path: `/faction/${faction.slug}/datasheet/${datasheet.slug}`
              }
            ]}
          />
        </div>

        {/* Header */}
        <PageHeader
          title={datasheet.name}
          subtitle={datasheetCost}
          action={{
            icon: <Share2 size={16} />,
            onClick: handleShare,
            ariaLabel: 'Share datasheet',
            variant: 'default',
            testId: 'share-datasheet-button'
          }}
          data-testid="datasheet-header"
        />

        {settings?.showFluff ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
            {datasheet.legend}
          </p>
        ) : null}
        <DatasheetProfile datasheet={datasheet} factionDatasheets={faction.datasheets} />
      </div>
    </AppLayout>
  );
};

export default DatasheetPage;
