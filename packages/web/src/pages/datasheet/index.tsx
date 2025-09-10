import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';

// components
import AppLayout from '@/components/layout';
import { Tabs, PageHeader, ErrorState, Breadcrumbs } from '@/components/ui';

// hooks
import useFaction from '@/hooks/use-faction';
import { useToast } from '@/contexts/toast/use-toast-context';

// page components
import DatasheetProfile from './components/datasheet-profile';
import DatasheetStratagems from './components/datasheet-stratagems';
import DatasheetAbilitiesTab from './components/datasheet-abilities-tab';
import Skeleton from './components/skeleton';

const DatasheetPage: React.FC = () => {
  const { factionId, id } = useParams<{ factionId: string; id: string }>();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const { data: faction, loading, error } = useFaction(factionId);

  const datasheet = useMemo(() => {
    if (faction && id) {
      return faction.datasheets.find((ds) => ds.id === id);
    }
    return undefined;
  }, [faction, id]);

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
          homeUrl={factionId ? `/faction/${factionId}` : '/'}
          data-testid="datasheet-not-found"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Datasheet">
      <div className="flex flex-col gap-4">
        {/* Mobile Back Button */}
        <div className="md:hidden">
          <Link
            to={`/faction/${faction.id}`}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
            aria-label={`Back to ${faction.name}`}
          >
            <ArrowLeft size={16} />
            <span className="font-medium">{faction.name}</span>
          </Link>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Factions', path: '/factions' },
              { label: faction.name, path: `/faction/${faction.id}` },
              { label: datasheet.name, path: `/faction/${faction.id}/datasheet/${datasheet.id}` }
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

        {/* Tabs */}
        <Tabs
          tabs={['Datasheet', 'Abilities', 'Stratagems']}
          active={activeTab}
          onChange={setActiveTab}
          data-testid="datasheet-tabs"
        >
          <DatasheetProfile datasheet={datasheet} />
          <DatasheetAbilitiesTab abilities={datasheet.abilities} />
          <DatasheetStratagems stratagems={datasheet.stratagems} />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DatasheetPage;
