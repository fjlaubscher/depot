import type { FC } from 'react';
import { useParams } from 'react-router-dom';

// components
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';

// hooks
import useFaction from '@/hooks/use-faction';
import useDatasheet from '@/hooks/use-datasheet';
import { buildAbsoluteUrl } from '@/utils/paths';
import { useShareAction } from '@/hooks/use-share-action';
import { useBookmarkAction } from '@/hooks/use-bookmark-action';
import { createDatasheetBookmark } from '@/utils/bookmarks';

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
  const bookmarkAction = useBookmarkAction(
    faction && datasheet ? createDatasheetBookmark(faction, datasheet) : undefined
  );

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
  // Codex sheets carry a literal "None" supplement label — nothing to show.
  const supplement = datasheet.supplementLabel ?? datasheet.sourceName;
  const eyebrowSuffix =
    supplement && !/^(none|codex)$/i.test(supplement.trim()) ? supplement : undefined;
  const headingSubtitle = eyebrowSuffix ? `Datasheet · ${eyebrowSuffix}` : 'Datasheet';

  return (
    <AppLayout
      title={pageTitle}
      back={{ to: backPath, label: faction.name }}
      crumbs={[
        { label: 'Rules', to: '/factions' },
        { label: faction.name, to: `/faction/${faction.slug}` }
      ]}
      heading={{ title: datasheet.name, subtitle: headingSubtitle }}
      actions={[
        bookmarkAction,
        {
          icon: shareAction.icon,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel ?? 'Share datasheet',
          'data-testid': shareAction['data-testid']
        }
      ]}
    >
      <div className="flex flex-col gap-3">
        <DatasheetProfile datasheet={datasheet} factionDatasheets={faction.datasheets} />
      </div>
    </AppLayout>
  );
};

export default DatasheetPage;
