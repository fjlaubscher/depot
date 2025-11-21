import type { FC } from 'react';
import { useParams } from 'react-router-dom';

// components
import AppLayout from '@/components/layout';
import { PageHeader, ErrorState, Breadcrumbs } from '@/components/ui';
import { BackButton } from '@/components/shared';

// hooks
import useFaction from '@/hooks/use-faction';
import useDatasheet from '@/hooks/use-datasheet';
import { useAppContext } from '@/contexts/app/use-app-context';
import { buildAbsoluteUrl } from '@/utils/paths';
import { useShareAction } from '@/hooks/use-share-action';

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
  const { state } = useAppContext();
  const settings = state.settings;
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

  return (
    <AppLayout title="Datasheet">
      <div className="flex flex-col gap-4">
        <BackButton
          to={`/faction/${faction.slug}`}
          label={faction.name}
          ariaLabel={`Back to ${faction.name}`}
          className="md:hidden"
        />

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Factions', path: '/factions' },
              { label: faction.name, path: `/faction/${faction.slug}` },
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
          actions={[shareAction]}
          alignActions="inline"
          data-testid="datasheet-header"
        />

        {settings?.showFluff ? (
          <p className="text-sm text-muted font-medium italic">{datasheet.legend}</p>
        ) : null}
        <DatasheetProfile datasheet={datasheet} factionDatasheets={faction.datasheets} />
      </div>
    </AppLayout>
  );
};

export default DatasheetPage;
