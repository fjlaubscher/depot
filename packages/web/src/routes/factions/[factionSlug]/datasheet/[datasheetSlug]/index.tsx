import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
  const { t: tc } = useTranslation('catalog');
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
    ariaLabel: t('share.datasheetLabel'),
    testId: 'share-datasheet',
    copySuccessKey: 'share.datasheetCopied',
    shareSuccessKey: 'share.datasheetShared'
  });

  const errorMessage = datasheetError || factionError;

  if (errorMessage) {
    return (
      <AppLayout title={t('error.label')}>
        <ErrorState
          title={tc('errors.datasheetTitle')}
          message={tc('errors.datasheetMessage')}
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
      <AppLayout title={tc('notFound')}>
        <ErrorState
          title={tc('errors.datasheetNotFound')}
          message={tc('errors.datasheetMissing')}
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
  const headingSubtitle = eyebrowSuffix ? `${tc('datasheet')} · ${eyebrowSuffix}` : tc('datasheet');

  return (
    <AppLayout
      title={pageTitle}
      back={{ to: backPath, label: faction.name }}
      crumbs={[
        { label: t('navigation.rules'), to: '/factions' },
        { label: faction.name, to: `/faction/${faction.slug}` }
      ]}
      heading={{ title: datasheet.name, subtitle: headingSubtitle }}
      actions={[
        bookmarkAction,
        {
          icon: shareAction.icon,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel ?? t('share.datasheetLabel'),
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
