import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaShareAlt, FaArrowLeft } from 'react-icons/fa';
import { depot } from '@depot/core';

// components
import AppLayout from '@/components/layout';
import Stat from '@/components/ui/stat';
import Tabs from '@/components/ui/tabs';
import IconButton from '@/components/ui/icon-button';
import NavigationButton from '@/components/ui/navigation-button';

// hooks
import useFaction from '@/hooks/use-faction';
import { useToast } from '@/contexts/toast/use-toast-context';

// page components
import DatasheetProfile from './components/datasheet-profile';
import DatasheetStratagems from './components/datasheet-stratagems';

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
    return (
      <AppLayout title="Error">
        <div className="space-y-4">
          <NavigationButton to={`/faction/${factionId}`}>
            <FaArrowLeft className="mr-2" />
            Back to Faction
          </NavigationButton>
          <div className="text-center py-8" data-testid="datasheet-error">
            <p className="text-red-600 dark:text-red-400">Error loading faction data: {error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Datasheet">
        <div className="space-y-4">
          <NavigationButton to={`/faction/${factionId}`}>
            <FaArrowLeft className="mr-2" />
            Back to Faction
          </NavigationButton>
          <div className="animate-pulse space-y-4" data-testid="datasheet-loader">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            <div className="flex justify-between">
              <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!datasheet) {
    return (
      <AppLayout title="Not Found">
        <div className="space-y-4">
          <NavigationButton to={`/faction/${factionId}`}>
            <FaArrowLeft className="mr-2" />
            Back to Faction
          </NavigationButton>
          <div className="text-center py-8" data-testid="datasheet-not-found">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Datasheet not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Datasheet">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <NavigationButton to={`/faction/${factionId}`} data-testid="back-to-faction">
            <FaArrowLeft className="mr-2" />
            Back to Faction
          </NavigationButton>
          <IconButton onClick={handleShare} aria-label="Share datasheet">
            <FaShareAlt />
          </IconButton>
        </div>

        {/* Header with Stats */}
        <div className="flex justify-between items-start" data-testid="datasheet-header">
          <Stat
            title={datasheet.role}
            value={datasheet.name}
            description={datasheetCost?.description}
            variant="large"
            className="text-left"
          />
          <Stat
            title="Points"
            value={datasheetCost?.cost || '-'}
            description={alternateCost?.cost}
            className="text-right"
          />
        </div>

        {/* Tabs */}
        <Tabs
          tabs={['Datasheet', 'Stratagems']}
          active={activeTab}
          onChange={setActiveTab}
          data-testid="datasheet-tabs"
        >
          <DatasheetProfile
            datasheet={datasheet}
            cost={datasheetCost}
            alternateCost={alternateCost}
          />
          <DatasheetStratagems stratagems={datasheet.stratagems} />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DatasheetPage;
