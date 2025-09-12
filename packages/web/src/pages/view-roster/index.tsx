import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Share, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button } from '@/components/ui';
import { generateRosterMarkdown, groupRosterUnitsByRole } from '@/utils/roster';
import UnitDetails from './components/unit-details';

const ViewRosterUnitCard: React.FC<{ unit: depot.RosterUnit }> = ({ unit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Collapsed Header - Always Visible */}
      <div
        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {unit.datasheet.name}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unit.modelCost.description}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {unitPoints} pts
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Details - Game Stats */}
      {isExpanded && <UnitDetails unit={unit} />}
    </div>
  );
};

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

  const pointsColor =
    roster.points.current > roster.points.max
      ? 'text-red-600 dark:text-red-400'
      : roster.points.current === roster.points.max
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-green-600 dark:text-green-400';

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Back Button */}
      <div className="md:hidden">
        <Link
          to="/rosters"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Rosters</span>
        </Link>
      </div>

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
        action={{
          icon: <Pencil size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}/edit`),
          ariaLabel: 'Edit roster'
        }}
      />

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Points</div>
            <div className={`text-2xl font-bold ${pointsColor}`}>
              {roster.points.current} / {roster.points.max}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Units</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {roster.units.length}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
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
        <div className="flex flex-col gap-6">
          {roleKeys.map((role) => (
            <div key={role} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {role.charAt(0).toUpperCase() + role.slice(1)} ({groupedUnits[role].length})
              </h3>
              <div className="flex flex-col gap-2">
                {groupedUnits[role].map((unit) => (
                  <ViewRosterUnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            </div>
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
