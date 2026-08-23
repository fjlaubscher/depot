import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';
import { Share2 } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';
import { DatasheetBrowser, PillTabs } from '@/components/shared';

// Hooks
import useFaction from '@/hooks/use-faction';
import { useSettingsContext } from '@/contexts/settings/context';
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

type FactionTab = 'datasheets' | 'detachments';

const Faction: React.FC<{ tab?: FactionTab }> = ({ tab = 'datasheets' }) => {
  const { factionSlug } = useParams<{ factionSlug: string }>();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { settings } = useSettingsContext();
  const navigate = useNavigate();
  // The tab is its own route so it can be linked and shared, and so back-nav
  // from a detachment page lands on the right tab. Replace rather than push —
  // switching tabs is a view toggle, not a place in the user's history.
  const showDetachments = tab === 'detachments';
  const selectTab = (value: FactionTab) =>
    navigate(
      value === 'detachments' ? `/faction/${factionSlug}/detachments` : `/faction/${factionSlug}`,
      {
        replace: true
      }
    );

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
    <AppLayout
      title={pageTitle}
      back={{ to: '/factions', label: 'Rules' }}
      heading={{ title: faction.name, subtitle: alliance }}
      actions={[
        bookmarkAction,
        {
          icon: shareAction.icon ?? <Share2 size={16} />,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel ?? 'Share faction',
          'data-testid': shareAction['data-testid']
        }
      ]}
    >
      <div className="flex flex-col gap-2">
        <PillTabs
          ariaLabel="Faction sections"
          testIdPrefix="faction-tab"
          active={tab}
          onChange={selectTab}
          tabs={[
            { value: 'datasheets', label: 'Datasheets', count: faction.datasheets.length },
            { value: 'detachments', label: 'Detachments', count: faction.detachments.length }
          ]}
        />

        {!showDetachments ? (
          <DatasheetBrowser
            datasheets={faction.datasheets}
            searchPlaceholder="Search datasheets by name..."
            emptyStateMessage="No datasheets found matching your search criteria."
            showItemCount={false}
            filters={datasheetFilters}
          />
        ) : (
          <FactionDetachments factionSlug={faction.slug} detachments={faction.detachments} />
        )}
      </div>
    </AppLayout>
  );
};

export default Faction;
