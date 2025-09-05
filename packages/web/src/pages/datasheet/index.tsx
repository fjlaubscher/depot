import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

// components
import AppLayout from '@/components/layout';
import Tabs from '@/components/ui/tabs';
import PageHeader from '@/components/ui/page-header';

// hooks
import useFaction from '@/hooks/use-faction';
import { useToast } from '@/contexts/toast/use-toast-context';

// page components
import DatasheetProfile from './components/datasheet-profile';
import DatasheetStratagems from './components/datasheet-stratagems';
import LoadingSkeleton from './components/loading-skeleton';
import DatasheetErrorState from './components/error-state';
import NotFoundState from './components/not-found-state';

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

  const datasheetCost = datasheet ? datasheet.modelCosts[0] : undefined;
  const alternateCost = datasheet ? datasheet.modelCosts[1] : undefined;

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
    return <DatasheetErrorState error={error} />;
  }

  if (loading || !faction) {
    return <LoadingSkeleton />;
  }

  if (!datasheet) {
    return (
      <NotFoundState
        title="Datasheet not found"
        message="The datasheet you're looking for doesn't exist or may have been removed."
        homeUrl={factionId ? `/faction/${factionId}` : '/'}
        testId="datasheet-not-found"
      />
    );
  }

  return (
    <AppLayout title="Datasheet">
      {/* Header */}
      <PageHeader
        title={datasheet.name}
        subtitle={`${faction?.name} • ${datasheet.role}`}
        action={{
          label: 'Share',
          onClick: handleShare,
          variant: 'secondary'
        }}
      />

      {/* Tabs */}
      <Tabs
        tabs={['Datasheet', 'Stratagems']}
        active={activeTab}
        onChange={setActiveTab}
        data-testid="datasheet-tabs"
      >
        <DatasheetProfile datasheet={datasheet} cost={datasheetCost} />
        <DatasheetStratagems stratagems={datasheet.stratagems} />
      </Tabs>
    </AppLayout>
  );
};

export default DatasheetPage;
