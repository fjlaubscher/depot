import { Fragment, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Pencil, Share2 } from 'lucide-react';

import { useAppContext } from '@/contexts/app/use-app-context';
import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import useCoreStratagems from '@/hooks/use-core-stratagems';
import useDownloadFile from '@/hooks/use-download-file';
import { safeSlug } from '@/utils/strings';
import type { ExportedRoster } from '@/types/export';
import { offlineStorage } from '@/data/offline-storage';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Tabs } from '@/components/ui';
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

const RosterView: FC = () => {
  const { state: roster } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { state: appState } = useAppContext();
  const downloadFile = useDownloadFile();
  const isCogitatorEnabled = appState.settings?.enableCogitator ?? false;
  const {
    stratagems: coreStratagems,
    loading: loadingCoreStratagems,
    error: coreStratagemsError
  } = useCoreStratagems();

  const factionName = getRosterFactionName(roster);
  const includeWargearOnExport = appState.settings?.includeWargearOnExport ?? true;
  const useNativeShare = appState.settings?.useNativeShare ?? true;
  const canUseNativeShare =
    useNativeShare && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleExportJson = async () => {
    let dataVersion: string | null = null;
    try {
      dataVersion = await offlineStorage.getDataVersion();
    } catch {
      dataVersion = null;
    }

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
