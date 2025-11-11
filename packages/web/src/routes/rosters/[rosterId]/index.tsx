import { Fragment, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Download, List, Pencil, Share } from 'lucide-react';

import { useAppContext } from '@/contexts/app/use-app-context';
import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import useCoreStratagems from '@/hooks/use-core-stratagems';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Tabs } from '@/components/ui';
import { BackButton, RosterHeader } from '@/components/shared';
import {
  generateRosterMarkdown,
  generateRosterShareText,
  getRosterFactionName
} from '@/utils/roster';
import UnitsTab from './_components/units-tab';
import DetachmentTab from './_components/detachment-overview';
import StratagemsTab from './_components/stratagems-tab';

const RosterView: FC = () => {
  const { state: roster } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { state: appState } = useAppContext();
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
  const shareText = useMemo(
    () =>
      generateRosterShareText(roster, factionName, {
        includeWargear: includeWargearOnExport
      }),
    [factionName, includeWargearOnExport, roster]
  );

  const handleExportMarkdown = () => {
    const markdown = generateRosterMarkdown(roster, factionName, {
      includeWargear: includeWargearOnExport
    });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roster.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Roster exported', type: 'success' });
  };

  const handleShareRoster = async () => {
    if (useNativeShare && navigator.share) {
      try {
        await navigator.share({
          title: roster.name,
          text: shareText
        });
        showToast({ title: 'Roster shared', type: 'success' });
      } catch (err) {
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const handleCopyRoster = async () => {
    await copyToClipboard(shareText);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ title: 'Roster copied to clipboard', type: 'success' });
    } catch (err) {
      showToast({ title: 'Failed to copy', type: 'error' });
    }
  };

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
          icon: <Pencil size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}/details`),
          ariaLabel: 'Edit roster details',
          testId: 'edit-roster-button'
        }}
      />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/rosters/${roster.id}/edit`)}
            className="flex items-center gap-2"
            data-testid="manage-units-button"
          >
            <List size={16} />
            Manage Units
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportMarkdown}
            className="flex items-center gap-2"
            data-testid="export-button"
          >
            <Download size={16} />
            Export
          </Button>
          {canUseNativeShare ? (
            <Button
              variant="secondary"
              onClick={handleShareRoster}
              className="flex items-center gap-2"
              data-testid="share-button"
            >
              <Share size={16} />
              Share
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleCopyRoster}
              className="flex items-center gap-2"
              data-testid="copy-button"
            >
              <Copy size={16} />
              Copy
            </Button>
          )}
        </div>
        <p className="text-xs text-subtle">
          Exports and sharing follow your Settings preferences (wargear visibility, sharing method).
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
    <AppLayout title="Roster">
      <RosterProvider rosterId={rosterId}>
        <RosterView />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterPage;
