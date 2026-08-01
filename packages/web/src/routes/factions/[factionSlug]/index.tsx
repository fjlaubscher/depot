import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, Tabs, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton } from '@/components/shared';

// Hooks
import useFaction from '@/hooks/use-faction';
import useBookmarks from '@/hooks/use-bookmarks';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import { useToast } from '@/contexts/toast/use-toast-context';

// Utils
import { getFactionAlliance } from '@depot/core/utils/common';
import { buildAbsoluteUrl } from '@/utils/paths';
import { useShareAction } from '@/hooks/use-share-action';
import { createFactionBookmark, factionBookmarkId } from '@/utils/bookmarks';

// Components
import Skeleton from './_components/skeleton';
import FactionDatasheets from './_components/faction-datasheets';
import FactionDetachments from './_components/detachments';

// Types
import type { depot } from '@depot/core';

const Faction: React.FC = () => {
  const { factionSlug } = useParams<{ factionSlug: string }>();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { settings } = useSettingsContext();
  const { showToast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [activeTab, setActiveTab] = useState(0);

  const showLegends = settings.showLegends ?? false;
  const showForgeWorld = settings.showForgeWorld ?? false;

  const datasheetFilters = useMemo(
    () => ({
      showLegends,
      showForgeWorld
    }),
    [showLegends, showForgeWorld]
  );

  const alliance = faction ? getFactionAlliance(faction.id) : '';
  const bookmarked = faction ? isBookmarked(factionBookmarkId(faction.slug)) : false;

  const handleToggleBookmark = useCallback(async () => {
    if (!faction) return;
    try {
      const next = await toggleBookmark(createFactionBookmark(faction));
      showToast({
        type: 'success',
        title: next ? 'Bookmarked' : 'Bookmark removed',
        message: next
          ? `${faction.name} pinned to your desk.`
          : `${faction.name} removed from bookmarks.`
      });
    } catch (err) {
      console.error('Failed to toggle faction bookmark', err);
      showToast({
        type: 'error',
        title: 'Bookmark failed',
        message: 'Could not update bookmarks.'
      });
    }
  }, [faction, showToast, toggleBookmark]);

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
          actions={[
            {
              icon: bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />,
              onClick: () => {
                void handleToggleBookmark();
              },
              ariaLabel: bookmarked ? 'Remove bookmark' : 'Bookmark faction',
              variant: bookmarked ? 'primary' : 'ghost',
              'data-testid': 'bookmark-faction-button'
            },
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
          <FactionDatasheets datasheets={faction.datasheets} filters={datasheetFilters} />
          <FactionDetachments detachments={faction.detachments} />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Faction;
