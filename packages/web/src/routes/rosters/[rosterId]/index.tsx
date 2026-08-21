import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Download, Pencil, Share2, RefreshCw } from 'lucide-react';
import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/context';
import { useToast } from '@/contexts/toast/context';
import useCoreStratagems from '@/hooks/use-core-stratagems';
import { downloadFile } from '@/utils/file';
import { safeSlug } from '@depot/core/utils/common';
import { CURRENT_GAME_EDITION, type ExportedRoster } from '@/types/export';
import { formatRebindSummaryMessage, refreshRosterDataWithReport } from '@/utils/refresh-user-data';
import { useSettingsContext } from '@/contexts/settings/context';
import { useFactionsContext } from '@/contexts/factions/context';
import { useShareAction } from '@/hooks/use-share-action';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Tabs, Alert } from '@/components/ui';
import { BackButton, RosterHeader } from '@/components/shared';
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
import { useDocumentTitle } from '@/hooks/use-document-title';
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
  useDocumentTitle(pageTitle);
  useScrollToHash({ enabled: Boolean(roster.id) });

  if (!roster.id) {
    return <Loader />;
  }

  const detachments = getRosterDetachments(roster);
  const tabs = [
    { label: 'Units', panel: <UnitsTab key="units" units={roster.units} /> },
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
    <div className="flex flex-col gap-4">
      <BackButton to="/rosters" label="Rosters" className="md:hidden" />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` }
          ]}
        />
      </div>

      {/* Header */}
      <PageHeader
        title={roster.name}
        subtitle={getRosterSubtitle(roster)}
        stats={<RosterHeader roster={roster} />}
        action={{
          icon: shareAction.icon,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel,
          testId: 'share-roster-button'
        }}
      />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/rosters/${roster.id}/edit`)}
            className="flex items-center gap-2"
            data-testid="manage-units-button"
          >
            <Pencil size={16} />
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportJson}
            className="flex items-center gap-2"
            data-testid="export-button"
          >
            <Download size={16} />
            Export
          </Button>
        </div>
        <p className="text-xs text-subtle">
          Export downloads a JSON you can import on another device. Sharing still follows your
          Settings preferences (wargear visibility, sharing method).
        </p>
      </div>

      {isRosterStale ? (
        <Alert variant="warning" title="Roster uses older data" className="gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-secondary">
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
  );
};

const RosterPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Roster Overview">
      <RosterProvider rosterId={rosterId}>
        <RosterView />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterPage;
