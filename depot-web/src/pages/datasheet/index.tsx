import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShareAlt, FaArrowLeft } from 'react-icons/fa';
import { depot } from 'depot-core';

// components
import Layout from '@/components/ui/layout';
import Stat from '@/components/ui/stat';
import Tabs from '@/components/ui/tabs';
import IconButton from '@/components/ui/icon-button';

// hooks
import useFaction from '@/hooks/use-faction';
import { useToast } from '@/contexts/toast/use-toast-context';

// page components
import DatasheetProfile from './components/datasheet-profile';
import DatasheetStratagems from './components/datasheet-stratagems';

const DatasheetPage: React.FC = () => {
  const { factionId, id } = useParams<{ factionId: string; id: string }>();
  const navigate = useNavigate();
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

  const handleBackClick = () => {
    navigate(`/faction/${factionId}`);
  };

  if (error) {
    return (
      <Layout
        title="Error"
        home={
          <IconButton onClick={handleBackClick} aria-label="Back to faction">
            <FaArrowLeft />
          </IconButton>
        }
      >
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Error loading faction data: {error}</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout
        title="Datasheet"
        isLoading={true}
        home={
          <IconButton onClick={handleBackClick} aria-label="Back to faction">
            <FaArrowLeft />
          </IconButton>
        }
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="flex justify-between">
            <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </Layout>
    );
  }

  if (!datasheet) {
    return (
      <Layout
        title="Not Found"
        home={
          <IconButton onClick={handleBackClick} aria-label="Back to faction">
            <FaArrowLeft />
          </IconButton>
        }
      >
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Datasheet not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Datasheet"
      home={
        <IconButton onClick={handleBackClick} aria-label="Back to faction">
          <FaArrowLeft />
        </IconButton>
      }
      action={
        <IconButton onClick={handleShare} aria-label="Share datasheet" className="ml-2">
          <FaShareAlt />
        </IconButton>
      }
    >
      {/* Header with Stats */}
      <div className="flex justify-between items-start mb-6" data-testid="datasheet-header">
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
        <DatasheetProfile datasheet={datasheet} />
        <DatasheetStratagems stratagems={datasheet.stratagems} />
      </Tabs>
    </Layout>
  );
};

export default DatasheetPage;
