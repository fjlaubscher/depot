import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { depot } from '@depot/core';
import { ArrowLeft, Pencil, Download, Share } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, CollapsibleSection, Button } from '@/components/ui';
import ViewRosterUnitCard from './components/view-roster-unit-card';
import { generateRosterMarkdown, groupRosterUnitsByRole } from '@/utils/roster';

const RosterView: React.FC = () => {
  const { state: roster } = useRoster();
  const { state: appState, getFaction } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [factionData, setFactionData] = useState<depot.Faction | null>(null);

  useEffect(() => {
    if (roster.id && roster.factionId) {
      getFaction(roster.factionId).then(setFactionData);
    }
  }, [roster.id, roster.factionId, getFaction]);

  const factionName = appState.factionIndex?.find(
    (f: depot.Index) => f.id === roster.factionId
  )?.name;

  const groupedUnits = useMemo(() => groupRosterUnitsByRole(roster.units), [roster.units]);
  const sortedRoleKeys = useMemo(() => Object.keys(groupedUnits).sort(), [groupedUnits]);

  // Collect all unique abilities referenced by units
  const globalAbilities = useMemo(() => {
    const abilitiesMap = new Map<string, depot.Ability>();
    roster.units.forEach((unit) => {
      unit.datasheet.abilities.forEach((ability) => {
        if (ability.description === '[Indexed]') {
          // For now, just collect the ability as-is since we don't have a global abilities collection
          // This would need to be enhanced when we have proper faction data structure
          abilitiesMap.set(ability.id, ability);
        }
      });
    });
    return Array.from(abilitiesMap.values()).sort((a: depot.Ability, b: depot.Ability) =>
      a.name.localeCompare(b.name)
    );
  }, [roster.units]);

  // Collect all unique wargear from units
  const globalWargear = useMemo(() => {
    const wargearMap = new Map<string, depot.Wargear>();
    roster.units.forEach((unit) => {
      unit.selectedWargear.forEach((wargear) => {
        wargearMap.set(wargear.name, wargear);
      });
      // Also collect default wargear from datasheet
      unit.datasheet.wargear.forEach((wargear) => {
        wargearMap.set(wargear.name, wargear);
      });
    });
    return Array.from(wargearMap.values()).sort((a: depot.Wargear, b: depot.Wargear) =>
      a.name.localeCompare(b.name)
    );
  }, [roster.units]);

  const handleEditRoster = () => {
    navigate(`/rosters/${roster.id}/edit`);
  };

  const handleExportMarkdown = () => {
    const markdown = generateRosterMarkdown(roster, factionName);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roster.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Roster exported as Markdown', type: 'success' });
  };

  const handleShareRoster = async () => {
    const markdown = generateRosterMarkdown(roster, factionName);

    if (navigator.share) {
      try {
        await navigator.share({
          title: roster.name,
          text: markdown
        });
        showToast({ title: 'Roster shared successfully', type: 'success' });
      } catch (err) {
        // User cancelled or error occurred, fallback to clipboard
        await copyToClipboard(markdown);
      }
    } else {
      await copyToClipboard(markdown);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ title: 'Roster copied to clipboard', type: 'success' });
    } catch (err) {
      showToast({ title: 'Failed to copy roster', type: 'error' });
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
      ? 'text-red-500 dark:text-red-400'
      : roster.points.current === roster.points.max
        ? 'text-yellow-500 dark:text-yellow-400'
        : 'text-green-500 dark:text-green-400';

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      {/* Mobile Back Button */}
      <div className="md:hidden print:hidden">
        <Link
          to="/rosters"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
          aria-label="Back to Rosters"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Rosters</span>
        </Link>
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block print:hidden">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` }
          ]}
        />
      </div>

      <PageHeader
        title={roster.name}
        subtitle={subtitle}
        action={{
          icon: <Pencil size={16} />,
          onClick: handleEditRoster,
          ariaLabel: 'Edit roster'
        }}
      />

      {/* Export Actions */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportMarkdown}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShareRoster}
          className="flex items-center gap-2"
        >
          <Share size={16} />
          Share
        </Button>
      </div>

      {/* Roster Stats */}
      <div className="bg-gray-50 dark:bg-gray-900 print:bg-gray-100 rounded-lg p-4 border border-gray-200 dark:border-gray-700 print:border-gray-300">
        <div className="flex justify-around items-center gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
              Points
            </div>
            <div className={`text-lg font-semibold ${pointsColor} print:text-black`}>
              {roster.points.current} / {roster.points.max}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
              Units
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white print:text-black">
              {roster.units.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
              Enhancements
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white print:text-black">
              {roster.enhancements.length}
            </div>
          </div>
        </div>
      </div>

      {/* Units by Role */}
      {roster.units.length > 0 && (
        <div className="flex flex-col gap-4">
          {sortedRoleKeys.map((role) => (
            <CollapsibleSection
              key={role}
              title={`${role.toUpperCase()} (${groupedUnits[role].length})`}
              defaultExpanded={true}
              className="border border-gray-200 dark:border-gray-700 print:border-gray-300 rounded-lg print:break-inside-avoid"
            >
              <div className="flex flex-col gap-4">
                {groupedUnits[role].map((unit) => (
                  <ViewRosterUnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            </CollapsibleSection>
          ))}
        </div>
      )}

      {roster.units.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 print:border-gray-300 rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 dark:text-gray-400 print:text-gray-600 text-lg">
              No units in this roster
            </p>
            <p className="text-gray-400 dark:text-gray-500 print:text-gray-500 text-sm">
              Use the edit button to start building your roster
            </p>
          </div>
        </div>
      )}

      {/* Global Abilities Section */}
      {globalAbilities.length > 0 && (
        <CollapsibleSection
          title="Global Abilities"
          defaultExpanded={false}
          className="border border-gray-200 dark:border-gray-700 print:border-gray-300 rounded-lg print:break-inside-avoid"
        >
          <div className="flex flex-col gap-3">
            {globalAbilities.map((ability) => (
              <div
                key={ability.id}
                className="border-b border-gray-200 dark:border-gray-700 print:border-gray-300 last:border-b-0 pb-3 last:pb-0"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white print:text-black mb-1">
                  {ability.name}
                </h4>
                <div
                  className="text-sm text-gray-700 dark:text-gray-300 print:text-black"
                  dangerouslySetInnerHTML={{ __html: ability.description }}
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Global Wargear Section */}
      {globalWargear.length > 0 && (
        <CollapsibleSection
          title="Global Wargear"
          defaultExpanded={false}
          className="border border-gray-200 dark:border-gray-700 print:border-gray-300 rounded-lg print:break-inside-avoid"
        >
          <div className="flex flex-col gap-3">
            {globalWargear.map((wargear: depot.Wargear) => (
              <div
                key={wargear.name}
                className="border-b border-gray-200 dark:border-gray-700 print:border-gray-300 last:border-b-0 pb-3 last:pb-0"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white print:text-black mb-1">
                  {wargear.name}
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 print:text-black">
                  <div className="flex gap-4 flex-wrap">
                    {wargear.range && (
                      <span>
                        <strong>Range:</strong> {wargear.range}
                      </span>
                    )}
                    {wargear.a && (
                      <span>
                        <strong>A:</strong> {wargear.a}
                      </span>
                    )}
                    {wargear.bsWs && (
                      <span>
                        <strong>BS/WS:</strong> {wargear.bsWs}+
                      </span>
                    )}
                    {wargear.s && (
                      <span>
                        <strong>S:</strong> {wargear.s}
                      </span>
                    )}
                    {wargear.ap && (
                      <span>
                        <strong>AP:</strong> {wargear.ap}
                      </span>
                    )}
                    {wargear.d && (
                      <span>
                        <strong>D:</strong> {wargear.d}
                      </span>
                    )}
                  </div>
                  {wargear.description && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                        {wargear.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
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
