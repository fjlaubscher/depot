import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, Share, Download } from 'lucide-react';
import { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button } from '@/components/ui';
import { BackButton, RosterHeader, RosterSection } from '@/components/shared';
import { generateRosterMarkdown, groupRosterUnitsByRole } from '@/utils/roster';
import ViewRosterUnitCard from './components/view-roster-unit-card';

const RosterView: React.FC = () => {
  const { state: roster } = useRoster();
  const { state: appState } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const factionName = appState.factionIndex?.find((f: any) => f.id === roster.factionId)?.name;

  const groupedUnits = useMemo(() => groupRosterUnitsByRole(roster.units), [roster.units]);
  const roleKeys = useMemo(() => Object.keys(groupedUnits).sort(), [groupedUnits]);

  const handleExportMarkdown = () => {
    const markdown = generateRosterMarkdown(roster, factionName);
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
    const markdown = generateRosterMarkdown(roster, factionName);

    if (navigator.share) {
      try {
        await navigator.share({
          title: roster.name,
          text: markdown
        });
        showToast({ title: 'Roster shared', type: 'success' });
      } catch (err) {
        await copyToClipboard(markdown);
      }
    } else {
      await copyToClipboard(markdown);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ title: 'Copied to clipboard', type: 'success' });
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
      : factionName || roster.factionId;

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
          onClick: () => navigate(`/rosters/${roster.id}/edit`),
          ariaLabel: 'Edit roster'
        }}
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="secondary"
          onClick={handleExportMarkdown}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </Button>
        <Button variant="secondary" onClick={handleShareRoster} className="flex items-center gap-2">
          <Share size={16} />
          Share
        </Button>
      </div>

      {/* Units List */}
      {roster.units.length > 0 ? (
        <div className="flex flex-col gap-4">
          {roleKeys.map((role) => (
            <RosterSection
              key={role}
              title={`${role.toUpperCase()} (${groupedUnits[role].length})`}
            >
              {groupedUnits[role].map((unit) => (
                <ViewRosterUnitCard key={unit.id} unit={unit} />
              ))}
            </RosterSection>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No units in this roster</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Use the edit button to start building your roster
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const RosterPage: React.FC = () => {
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
