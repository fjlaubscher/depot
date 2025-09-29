import React, { useCallback, useState, useMemo, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, Tabs, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton } from '@/components/shared';

// Hooks
import useFaction from '@/hooks/use-faction';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';

// Utils
import { getFactionAlliance } from '@/utils/faction';

// Components
import Skeleton from './components/skeleton';
import FactionDatasheets from './components/faction-datasheets';
import FactionDetachments from './components/faction-detachments';

// Types
import { depot } from '@depot/core';

const Faction: React.FC = () => {
  const { factionSlug } = useParams<{ factionSlug: string }>();
  const { showToast } = useToast();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { state, updateMyFactions } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);

  const isMyFaction = useMemo(() => {
    if (state.myFactions && factionSlug) {
      return state.myFactions.some((f) => f.slug === factionSlug || f.id === factionSlug);
    }
    return false;
  }, [factionSlug, state.myFactions]);

  const toggleMyFaction = useCallback(async () => {
    if (!faction || !factionSlug) return;

    try {
      if (state.myFactions && isMyFaction) {
        await updateMyFactions(
          state.myFactions.filter((f) => f.slug !== factionSlug && f.id !== factionSlug)
        );
        startTransition(() => {
          showToast({
            type: 'success',
            title: 'Success',
            message: `${faction.name} removed from My Factions.`
          });
        });
      } else {
        const myFaction: depot.Option = {
          id: faction.id,
          slug: faction.slug,
          name: faction.name
        };
        await updateMyFactions(state.myFactions ? [...state.myFactions, myFaction] : [myFaction]);
        startTransition(() => {
          showToast({
            type: 'success',
            title: 'Success',
            message: `${faction.name} added to My Factions.`
          });
        });
      }
    } catch (error) {
      startTransition(() => {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update My Factions. Please try again.'
        });
      });
    }
  }, [isMyFaction, faction, state.myFactions, updateMyFactions, showToast, factionSlug]);

  const alliance = faction ? getFactionAlliance(faction.id) : '';

  // Error State Component
  if (error) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Faction"
          message="We encountered an error while trying to load this faction. This could be due to network issues or the faction may not exist."
          stackTrace={error}
          data-testid="error-state"
        />
      </AppLayout>
    );
  }

  // Loading State
  if (loading || !faction) {
    return <Skeleton />;
  }

  if (!faction) {
    return (
      <AppLayout title="Not Found">
        <ErrorState
          title="Faction not found"
          message="The faction you're looking for doesn't exist or may have been removed."
          showRetry={false}
          homeUrl="/"
          data-testid="faction-not-found"
        />
      </AppLayout>
    );
  }

  // Main Content
  return (
    <AppLayout title="Faction">
      <div className="flex flex-col gap-4">
        <BackButton
          to="/factions"
          label="Factions"
          ariaLabel="Back to Factions"
          className="md:hidden"
        />

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Factions', path: '/factions' },
              { label: faction.name, path: `/faction/${faction.slug}` }
            ]}
          />
        </div>

        <PageHeader
          title={faction.name}
          subtitle={alliance}
          action={{
            icon: isMyFaction ? (
              <Star size={16} className="text-primary-500 fill-current" />
            ) : (
              <Star size={16} />
            ),
            onClick: toggleMyFaction,
            ariaLabel: isMyFaction ? 'Remove from My Factions' : 'Add to My Factions'
          }}
        />

        <Tabs tabs={['Datasheets', 'Detachments']} active={activeTab} onChange={setActiveTab}>
          <FactionDatasheets datasheets={faction.datasheets} />
          <FactionDetachments
            detachmentAbilities={faction.detachmentAbilities}
            enhancements={faction.enhancements}
            stratagems={faction.stratagems}
          />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Faction;
