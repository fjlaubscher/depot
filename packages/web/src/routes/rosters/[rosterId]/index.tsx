import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from '@/lib/navigation';
import { Copy, Download, Pencil, Share2, RefreshCw } from 'lucide-react';
import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/context';
import { useToast } from '@/contexts/toast/context';
import useCoreStratagems from '@/hooks/use-core-stratagems';
import { useCollections } from '@/hooks/use-collections';
import { downloadFile } from '@/utils/file';
import { safeSlug } from '@depot/core/utils/common';
import { CURRENT_GAME_EDITION, type ExportedRoster } from '@/types/export';
import { formatRebindSummaryMessage, refreshRosterDataWithReport } from '@/utils/refresh-user-data';
import { useSettingsContext } from '@/contexts/settings/context';
import { useFactionsContext } from '@/contexts/factions/context';
import { useShareAction } from '@/hooks/use-share-action';

import AppLayout from '@/components/layout';
import { Loader, Button, Tabs, Alert } from '@/components/ui';
import { RosterHeader } from '@/components/shared';
import { generateRosterShareText } from '@/utils/roster';
import {
  getRosterDetachments,
  getRosterFactionName,
  getRosterSubtitle
} from '@depot/core/utils/roster';
import RosterIssues from '@/routes/rosters/_components/roster-issues';
import UnitsTab from './_components/units-tab';
import DetachmentTab from './_components/detachment-overview';
import StratagemsTab from './_components/stratagems-tab';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

const RosterView: FC = () => {
  const { state: roster, setRoster } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSettingsContext();
  const {
    dataVersion: catalogueDataVersion,
    getDatasheet,
    getFactionManifest
  } = useFactionsContext();
  const {
    stratagems: coreStratagems,
    loading: loadingCoreStratagems,
    error: coreStratagemsError
  } = useCoreStratagems();
  const { collections } = useCollections();
  const [refreshingRoster, setRefreshingRoster] = useState(false);

  const factionName = getRosterFactionName(roster);
  const includeWargearOnExport = settings.includeWargearOnExport ?? true;
  const useNativeShare = settings.useNativeShare ?? true;
  const canUseNativeShare =
    useNativeShare && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleExportJson = async () => {
    const dataVersion = roster.dataVersion ?? catalogueDataVersion ?? null;
    const payload: ExportedRoster = {
      kind: 'roster',
      version: 1,
      dataVersion,
      edition: CURRENT_GAME_EDITION,
      roster
    };

    downloadFile(
      `roster-${safeSlug(roster.name)}-${roster.id}.json`,
      JSON.stringify(payload, null, 2)
    );
    showToast({ title: 'Roster exported', type: 'success' });
  };

  const shareText = useMemo(
    () => generateRosterShareText(roster, factionName, { includeWargear: includeWargearOnExport }),
    [factionName, includeWargearOnExport, roster]
  );

  const rosterVersion = roster.dataVersion ?? null;
  const currentDataVersion = catalogueDataVersion ?? null;
  const isRosterStale = Boolean(currentDataVersion && rosterVersion !== currentDataVersion);

  const handleRefreshRosterData = async () => {
    if (refreshingRoster) return;
    if (!currentDataVersion) {
      showToast({
        type: 'warning',
        title: 'No data version detected',
        message: 'Unable to refresh because the current data version is unknown.'
      });
      return;
    }

    setRefreshingRoster(true);
    try {
      const result = await refreshRosterDataWithReport({
        roster,
        currentDataVersion,
        getDatasheet,
        getFactionManifest
      });

      setRoster(result.roster);
      const rebindNote = formatRebindSummaryMessage(result.summary);
      showToast({
        title: 'Roster updated',
        message: rebindNote
          ? `Refreshed with the latest data. ${rebindNote}`
          : 'Refreshed with the latest Wahapedia data.',
        type: rebindNote ? 'warning' : 'success'
      });
    } catch (error) {
      console.error('Failed to refresh roster data', error);
      showToast({
        title: 'Refresh failed',
        message: 'Could not refresh with the latest data.',
        type: 'error'
      });
    } finally {
      setRefreshingRoster(false);
    }
  };

  const shareAction = useShareAction({
    title: roster.name,
    text: shareText,
    icon: canUseNativeShare ? <Share2 size={16} /> : <Copy size={16} />,
    ariaLabel: canUseNativeShare ? 'Share roster' : 'Copy roster share text',
    testId: 'share-roster-button',
    copySuccessMessage: 'Roster copied to clipboard.',
    shareSuccessMessage: 'Roster shared.'
  });

  const pageTitle = roster.name ? `${roster.name} - Roster Overview` : 'Roster Overview';
  useScrollToHash({ enabled: Boolean(roster.id) });

  if (!roster.id) {
    return (
      <AppLayout title="Roster Overview" back={{ to: '/rosters', label: 'Rosters' }}>
        <Loader />
      </AppLayout>
    );
  }

  const linkedCollection = roster.collectionId
    ? collections.find((collection) => collection.id === roster.collectionId)
    : undefined;

  const detachments = getRosterDetachments(roster);
  const tabs = [
    { label: 'Units', panel: <UnitsTab key="units" roster={roster} /> },
    ...detachments.map((detachment) => ({
      label: detachments.length === 1 ? 'Detachment' : detachment.name,
      panel: (
        <DetachmentTab
          key={`detachment-${detachment.id}`}
          detachment={detachment}
          factionSlug={roster.factionSlug}
          rosterEnhancements={roster.enhancements.filter((entry) =>
            detachment.enhancements.some((candidate) => candidate.id === entry.enhancement.id)
          )}
          units={roster.units}
        />
      )
    })),
    {
      label: 'Stratagems',
      panel: (
        <StratagemsTab
          key="stratagems"
          coreStratagems={coreStratagems}
          detachmentStratagems={detachments.flatMap((detachment) => detachment.stratagems)}
          units={roster.units}
          loadingCore={loadingCoreStratagems}
          coreError={coreStratagemsError}
        />
      )
    }
  ];

  return (
    <AppLayout
      title={pageTitle}
      back={{ to: '/rosters', label: 'Rosters' }}
      crumbs={[
        { label: 'Armies', to: '/armies' },
        { label: 'Rosters', to: '/rosters' },
        { label: roster.name }
      ]}
      heading={{
        title: roster.name,
        subtitle: getRosterSubtitle(roster),
        meta: linkedCollection ? (
          <Link
            to={`/collections/${linkedCollection.id}`}
            className="mt-0.5 truncate text-xs font-medium text-muted hover:text-foreground"
            data-testid="roster-collection-link"
          >
            Collection · {linkedCollection.name}
          </Link>
        ) : undefined
      }}
      actions={[
        {
          icon: <Pencil size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}/edit`),
          ariaLabel: 'Edit roster units',
          'data-testid': 'manage-units-button'
        },
        {
          icon: shareAction.icon,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel ?? 'Share roster',
          'data-testid': 'share-roster-button'
        }
      ]}
      footer={
        <Button
          variant="secondary"
          fullWidth
          onClick={handleExportJson}
          data-testid="export-button"
        >
          <Download size={16} />
          Export JSON
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="surface-card p-3">
          <RosterHeader roster={roster} />
        </div>

        {isRosterStale ? (
          <Alert variant="warning" title="Roster uses older data" className="gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted">
                Refresh to pull the latest Wahapedia data into this roster.
              </span>
              <Button
                variant="secondary"
                onClick={() => void handleRefreshRosterData()}
                disabled={refreshingRoster}
                data-testid="refresh-roster-data"
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {refreshingRoster ? 'Refreshing…' : 'Refresh with latest data'}
              </Button>
            </div>
          </Alert>
        ) : null}

        <RosterIssues roster={roster} />

        {/* Units, Detachment & Stratagems */}
        <Tabs tabs={tabs.map((tab) => tab.label)} data-testid="roster-tabs">
          {tabs.map((tab) => tab.panel)}
        </Tabs>
      </div>
    </AppLayout>
  );
};

const RosterPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <RosterProvider rosterId={rosterId}>
      <RosterView />
    </RosterProvider>
  );
};

export default RosterPage;
