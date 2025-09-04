import React, { useCallback, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, Tabs, IconButton, ErrorState } from '@/components/ui';

// Hooks
import useFaction from '@/hooks/use-faction';
import useMyFactions from '@/hooks/use-my-factions';
import { useToast } from '@/contexts/toast/use-toast-context';

// Utils
import { getFactionAlliance } from '@/utils/faction';

// Components
import LoadingSkeleton from './components/loading-skeleton';
import FactionDatasheets from './components/faction-datasheets';
import FactionStratagems from './components/faction-stratagems';
import FactionDetachments from './components/faction-detachments';
import FactionEnhancements from './components/faction-enhancements';

// Types
import { depot } from '@depot/core';

const Faction: React.FC = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { data: faction, loading, error } = useFaction(id);

  const [myFactions, setMyFactions] = useMyFactions();
  const [activeTab, setActiveTab] = useState(0);

  const isMyFaction = useMemo(() => {
    if (myFactions && id) {
      return myFactions.some((f) => f.id === id);
    }
    return false;
  }, [id, myFactions]);

  const toggleMyFaction = useCallback(async () => {
    if (!faction || !id) return;

    try {
      if (myFactions && isMyFaction) {
        await setMyFactions(myFactions.filter((f) => f.id !== id));
        showToast({
          type: 'success',
          title: 'Success',
          message: `${faction.name} removed from My Factions.`
        });
      } else {
        const myFaction: depot.Option = { id: faction.id, name: faction.name };
        await setMyFactions(myFactions ? [...myFactions, myFaction] : [myFaction]);
        showToast({
          type: 'success',
          title: 'Success',
          message: `${faction.name} added to My Factions.`
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update My Factions. Please try again.'
      });
    }
  }, [isMyFaction, faction, myFactions, setMyFactions, showToast, id]);

  const alliance = faction ? getFactionAlliance(faction.id) : '';

  // Loading State
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error State Component
  if (error) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Faction"
          message="We encountered an error while trying to load this faction. This could be due to network issues or the faction may not exist."
          stackTrace={error}
        />
      </AppLayout>
    );
  }

  // Main Content
  return (
    <AppLayout title="Faction">
      {faction && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <PageHeader title={faction.name} subtitle={alliance} className="mb-0" />
            <IconButton
              onClick={toggleMyFaction}
              aria-label={isMyFaction ? 'Remove from My Factions' : 'Add to My Factions'}
            >
              {isMyFaction ? <FaStar className="text-primary-500" /> : <FaStar />}
            </IconButton>
          </div>

          <Tabs
            tabs={['Datasheets', 'Detachments', 'Enhancements', 'Stratagems']}
            active={activeTab}
            onChange={setActiveTab}
          >
            <FactionDatasheets datasheets={faction.datasheets} />
            <FactionDetachments detachmentAbilities={faction.detachmentAbilities} />
            <FactionEnhancements enhancements={faction.enhancements} />
            <FactionStratagems stratagems={faction.stratagems} />
          </Tabs>
        </div>
      )}
    </AppLayout>
  );
};

export default Faction;
