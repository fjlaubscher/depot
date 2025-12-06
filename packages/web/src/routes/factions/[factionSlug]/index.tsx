import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, Tabs, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton } from '@/components/shared';

// Hooks
import useFaction from '@/hooks/use-faction';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

// Utils
import { getFactionAlliance } from '@/utils/faction';
import { buildAbsoluteUrl } from '@/utils/paths';
import { useShareAction } from '@/hooks/use-share-action';

// Components
import Skeleton from './_components/skeleton';
import FactionDatasheets from './_components/faction-datasheets';
import FactionDetachments from './_components/detachments';

// Types
import type { depot } from '@depot/core';

const Faction: React.FC = () => {
  const { factionSlug } = useParams<{ factionSlug: string }>();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);

  const showLegends = state.settings?.showLegends ?? false;
  const showForgeWorld = state.settings?.showForgeWorld ?? false;

  const datasheetFilters = useMemo(
    () => ({
      showLegends,
      showForgeWorld
    }),
    [showLegends, showForgeWorld]
  );

  const alliance = faction ? getFactionAlliance(faction.id) : '';
  const shareAction = useShareAction({
    title: faction?.name,
    url: faction ? buildAbsoluteUrl(`/faction/${faction.slug}`) : undefined,
    ariaLabel: 'Share faction link',
    testId: 'share-faction',
    copySuccessMessage: 'Faction link copied to clipboard.',
    shareSuccessMessage: 'Faction link shared.'
  });

  useScrollToHash({ enabled: !loading && Boolean(faction) });

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
  const pageTitle = `${faction.name} - Faction Overview`;

  return (
    <AppLayout title={pageTitle}>
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
            icon: shareAction.icon ?? <Share2 size={16} />,
            onClick: () => shareAction.onClick(),
            ariaLabel: shareAction.ariaLabel ?? 'Share faction',
            testId: shareAction['data-testid']
          }}
        />

        <Tabs
          tabs={['Datasheets', 'Detachments']}
          active={activeTab}
          onChange={setActiveTab}
          tabTestIdPrefix="faction-tab"
        >
          <FactionDatasheets datasheets={faction.datasheets} filters={datasheetFilters} />
          <FactionDetachments detachments={faction.detachments} />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Faction;
