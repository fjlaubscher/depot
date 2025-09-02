import React, { useCallback, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaRegHeart } from 'react-icons/fa';

// UI Components
import Layout from '@/components/ui/layout';
import IconButton from '@/components/ui/icon-button';
import Stat from '@/components/ui/stat';
import Tabs from '@/components/ui/tabs';

// Hooks
import useFaction from '@/hooks/use-faction';
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from '@/contexts/toast/use-toast-context';

// Utils
import { getFactionAlliance } from '@/utils/faction';

// Components
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

  const [myFactions, setMyFactions] = useLocalStorage<depot.Option[]>('my-factions');
  const [activeTab, setActiveTab] = useState(0);

  const isMyFaction = useMemo(() => {
    if (myFactions && id) {
      return myFactions.some((f) => f.id === id);
    }
    return false;
  }, [id, myFactions]);

  const toggleMyFaction = useCallback(() => {
    if (!faction || !id) return;

    if (myFactions && isMyFaction) {
      setMyFactions(myFactions.filter((f) => f.id !== id));
      showToast({
        type: 'success',
        title: 'Success',
        message: `${faction.name} removed from My Factions.`
      });
    } else {
      const myFaction: depot.Option = { id: faction.id, name: faction.name };
      setMyFactions(myFactions ? [...myFactions, myFaction] : [myFaction]);
      showToast({
        type: 'success',
        title: 'Success',
        message: `${faction.name} added to My Factions.`
      });
    }
  }, [isMyFaction, faction, myFactions, setMyFactions, showToast, id]);

  const alliance = faction ? getFactionAlliance(faction.id) : '';

  // Error State Component
  if (error) {
    return (
      <Layout
        title="Error"
        home={
          <Link to="/">
            <FaArrowLeft />
          </Link>
        }
      >
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Failed to load faction: {error}</p>
        </div>
      </Layout>
    );
  }

  // Main Content
  return (
    <Layout
      title="Faction"
      isLoading={loading}
      home={
        <Link to="/">
          <FaArrowLeft />
        </Link>
      }
      action={
        faction && (
          <IconButton
            onClick={toggleMyFaction}
            aria-label={isMyFaction ? 'Remove from My Factions' : 'Add to My Factions'}
          >
            {isMyFaction ? <FaStar className="text-blue-500" /> : <FaStar />}
          </IconButton>
        )
      }
    >
      {faction && (
        <div className="space-y-6">
          <Stat title={alliance} value={faction.name} />

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
    </Layout>
  );
};

export default Faction;
