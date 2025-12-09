import { Fragment, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Pencil, Share2, RefreshCw } from 'lucide-react';
import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import useCoreStratagems from '@/hooks/use-core-stratagems';
import useDownloadFile from '@/hooks/use-download-file';
import { safeSlug } from '@depot/core/utils/common';
import type { ExportedRoster } from '@/types/export';
import { refreshRosterData } from '@/utils/refresh-user-data';
import useSettings from '@/hooks/use-settings';
import useFactionIndex from '@/hooks/use-faction-index';
import useFactionData from '@/hooks/use-faction-data';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Tabs, Alert } from '@/components/ui';
import { BackButton, RosterHeader } from '@/components/shared';
import ExportButton from '@/components/shared/export-button';
import {
  generateRosterMarkdown,
  generateRosterShareText,
  getRosterFactionName
} from '@/utils/roster';
import UnitsTab from './_components/units-tab';
import DetachmentTab from './_components/detachment-overview';
import StratagemsTab from './_components/stratagems-tab';
import CogitatorTab from './_components/cogitator-tab';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

const RosterView: FC = () => {
  const { state: roster, setRoster } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { dataVersion: catalogueDataVersion } = useFactionIndex();
  const { getDatasheet, getFactionManifest } = useFactionData();
  const downloadFile = useDownloadFile();
  const isCogitatorEnabled = settings.enableCogitator ?? false;
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
      roster
    };

    downloadFile(
      `roster-${safeSlug(roster.name)}-${roster.id}.json`,
      JSON.stringify(payload, null, 2)
    );
    showToast({ title: 'Roster exported', type: 'success' });
  };

  const shareText = useMemo(
    () =>
      generateRosterShareText(roster, factionName, {
        includeWargear: includeWargearOnExport,
        includeWargearAbilities: includeWargearOnExport
      }),
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
      const refreshed = await refreshRosterData({
        roster,
        currentDataVersion,
        getDatasheet,
        getFactionManifest
      });

      setRoster(refreshed);
      showToast({
        title: 'Roster updated',
        message: 'Refreshed with the latest Wahapedia data.',
        type: 'success'
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ title: 'Roster copied to clipboard', type: 'success' });
    } catch (err) {
      showToast({ title: 'Failed to copy', type: 'error' });
    }
  };

  const handleShareRoster = async () => {
    if (canUseNativeShare) {
      try {
        await navigator.share({
          title: roster.name,
          text: shareText
        });
        showToast({ title: 'Roster shared', type: 'success' });
        return;
      } catch {
        // fall through to copy
      }
    }

    await copyToClipboard(shareText);
  };

  const pageTitle = roster.name ? `${roster.name} - Roster Overview` : 'Roster Overview';
  useDocumentTitle(pageTitle);
  useScrollToHash({ enabled: Boolean(roster.id) });

  if (!roster.id) {
    return <Loader />;
  }

  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName;

  const tabLabels: string[] = ['Units'];
  const tabPanels: ReactNode[] = [<UnitsTab key="units" units={roster.units} />];

  if (roster.detachment) {
    tabLabels.push('Detachment');
    tabPanels.push(
      <DetachmentTab
        key="detachment"
        detachment={roster.detachment}
        rosterEnhancements={roster.enhancements}
        units={roster.units}
      />
    );
  }

  tabLabels.push('Stratagems');
  tabPanels.push(
    <StratagemsTab
      key="stratagems"
      coreStratagems={coreStratagems}
      detachmentStratagems={roster.detachment?.stratagems ?? []}
      units={roster.units}
      loadingCore={loadingCoreStratagems}
      coreError={coreStratagemsError}
    />
  );

  if (isCogitatorEnabled) {
    tabLabels.push('Cogitator');
    tabPanels.push(<CogitatorTab key="cogitator" roster={roster} />);
  }

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
        subtitle={subtitle}
        stats={<RosterHeader roster={roster} />}
        action={{
          icon: canUseNativeShare ? <Share2 size={16} /> : <Copy size={16} />,
          onClick: () => void handleShareRoster(),
          ariaLabel: canUseNativeShare ? 'Share roster' : 'Copy roster share text',
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
          <ExportButton onClick={handleExportJson} />
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

      {/* Units, Detachment & Stratagems */}
      <Tabs tabs={tabLabels} data-testid="roster-tabs">
        {tabPanels.map((panel, index) => (
          <Fragment key={`roster-tab-panel-${index}`}>{panel}</Fragment>
        ))}
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
