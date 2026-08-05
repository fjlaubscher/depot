import type { FC } from 'react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';

// components
import AppLayout from '@/components/layout';
import { PageHeader, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton } from '@/components/shared';

// hooks
import useFaction from '@/hooks/use-faction';
import useDatasheet from '@/hooks/use-datasheet';
import useBookmarks from '@/hooks/use-bookmarks';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { buildAbsoluteUrl } from '@/utils/paths';
import { useShareAction } from '@/hooks/use-share-action';
import { createDatasheetBookmark, datasheetBookmarkId } from '@/utils/bookmarks';

// page components
import { DatasheetProfile } from '@/components/shared/datasheet';
import Skeleton from './_components/skeleton';

const DatasheetPage: FC = () => {
  const { factionSlug, datasheetSlug } = useParams<{
    factionSlug: string;
    datasheetSlug: string;
  }>();
  const { data: faction, loading: factionLoading, error: factionError } = useFaction(factionSlug);
  const {
    data: datasheet,
    loading: datasheetLoading,
    error: datasheetError
  } = useDatasheet(factionSlug, datasheetSlug);
  const { settings } = useSettingsContext();
  const { showToast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const bookmarked =
    faction && datasheet ? isBookmarked(datasheetBookmarkId(faction.slug, datasheet.slug)) : false;

  const handleToggleBookmark = useCallback(async () => {
    if (!faction || !datasheet) return;
    try {
      const next = await toggleBookmark(createDatasheetBookmark(faction, datasheet));
      showToast({
        type: 'success',
        title: next ? 'Bookmarked' : 'Bookmark removed',
        message: next
          ? `${datasheet.name} pinned to your desk.`
          : `${datasheet.name} removed from bookmarks.`
      });
    } catch (err) {
      console.error('Failed to toggle datasheet bookmark', err);
      showToast({
        type: 'error',
        title: 'Bookmark failed',
        message: 'Could not update bookmarks.'
      });
    }
  }, [datasheet, faction, showToast, toggleBookmark]);

  const shareAction = useShareAction({
    title: datasheet?.name,
    url:
      faction && datasheet
        ? buildAbsoluteUrl(`/faction/${faction.slug}/datasheet/${datasheet.slug}`)
        : undefined,
    ariaLabel: 'Share datasheet link',
    testId: 'share-datasheet',
    copySuccessMessage: 'Datasheet link copied to clipboard.',
    shareSuccessMessage: 'Datasheet link shared.'
  });

  const errorMessage = datasheetError || factionError;

  if (errorMessage) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Datasheet"
          message="We encountered an error while trying to load this datasheet. This could be due to network issues or the datasheet may not exist."
          stackTrace={errorMessage}
          data-testid="datasheet-error"
        />
      </AppLayout>
    );
  }

  if (datasheetLoading || factionLoading) {
    return <Skeleton />;
  }

  if (!faction || !datasheet) {
    return (
      <AppLayout title="Not Found">
        <ErrorState
          title="Datasheet not found"
          message="The datasheet you're looking for doesn't exist or may have been removed."
          showRetry={false}
          homeUrl={factionSlug ? `/faction/${factionSlug}` : '/'}
          data-testid="datasheet-not-found"
        />
      </AppLayout>
    );
  }

  const pageTitle = `${datasheet.name} - ${faction.name}`;
  const backPath = `/faction/${faction.slug}#${datasheet.id}`;

  return (
    <AppLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <BackButton
          to={backPath}
          label={faction.name}
          ariaLabel={`Back to ${faction.name}`}
          className="md:hidden"
        />

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Factions', path: '/factions' },
              { label: faction.name, path: backPath },
              {
                label: datasheet.name,
                path: `/faction/${faction.slug}/datasheet/${datasheet.slug}`
              }
            ]}
          />
        </div>

        {/* Header */}
        <PageHeader
          title={datasheet.name}
          subtitle={datasheet.sourceName}
          actions={[
            {
              icon: bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />,
              onClick: () => {
                void handleToggleBookmark();
              },
              ariaLabel: bookmarked ? 'Remove bookmark' : 'Bookmark datasheet',
              variant: bookmarked ? 'primary' : 'ghost',
              'data-testid': 'bookmark-datasheet-button'
            },
            {
              icon: shareAction.icon,
              onClick: () => shareAction.onClick(),
              ariaLabel: shareAction.ariaLabel ?? 'Share datasheet',
              'data-testid': shareAction['data-testid']
            }
          ]}
          data-testid="datasheet-header"
        />

        {settings?.showFluff && datasheet.legend?.trim() ? (
          <p className="text-sm text-muted font-medium italic">{datasheet.legend}</p>
        ) : null}
        <DatasheetProfile datasheet={datasheet} factionDatasheets={faction.datasheets} />
      </div>
    </AppLayout>
  );
};

export default DatasheetPage;
