import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, Tabs, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton, DatasheetBrowser } from '@/components/shared';

// Hooks
import useFaction from '@/hooks/use-faction';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

// Utils
import { getFactionAlliance } from '@depot/core/utils/common';
import { buildAbsoluteUrl } from '@/utils/paths';
import { useShareAction } from '@/hooks/use-share-action';
import { useBookmarkAction } from '@/hooks/use-bookmark-action';
import { createFactionBookmark } from '@/utils/bookmarks';

// Components
import Skeleton from './_components/skeleton';
import FactionDetachments from './_components/faction-detachments';

const Faction: React.FC = () => {
  const { factionSlug } = useParams<{ factionSlug: string }>();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { settings } = useSettingsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  // Tab lives in the URL so back-nav from a detachment page lands on the right tab.
  const activeTab = searchParams.get('tab') === 'detachments' ? 1 : 0;
  const setActiveTab = (index: number) =>
    setSearchParams(index === 1 ? { tab: 'detachments' } : {}, { replace: true });

  const datasheetFilters = {
    showLegends: settings.showLegends ?? false,
    showForgeWorld: settings.showForgeWorld ?? false
  };

  const alliance = faction ? getFactionAlliance(faction.id) : '';
  const bookmarkAction = useBookmarkAction(faction ? createFactionBookmark(faction) : undefined);

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
          actions={[
            bookmarkAction,
            {
              icon: shareAction.icon ?? <Share2 size={16} />,
              onClick: () => shareAction.onClick(),
              ariaLabel: shareAction.ariaLabel ?? 'Share faction',
              'data-testid': shareAction['data-testid']
            }
          ]}
        />

        <Tabs
          tabs={['Datasheets', 'Detachments']}
          active={activeTab}
          onChange={setActiveTab}
          tabTestIdPrefix="faction-tab"
        >
          <DatasheetBrowser
            datasheets={faction.datasheets}
            searchPlaceholder="Search datasheets by name..."
            emptyStateMessage="No datasheets found matching your search criteria."
            showItemCount={false}
            filters={datasheetFilters}
          />
          <FactionDetachments factionSlug={faction.slug} detachments={faction.detachments} />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Faction;
