import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { depot } from '@depot/core';
import { ArrowLeft } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Card } from '@/components/ui';
import { DatasheetBrowser, DatasheetSelectionCard } from '@/components/shared/datasheet';

const AddRosterUnitsView: React.FC = () => {
  const { state: roster, addUnit } = useRoster();
  const { getFaction } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [factionData, setFactionData] = useState<depot.Faction | null>(null);

  const {
    selectedUnits,
    totalSelectedPoints,
    addToSelection,
    removeLatestUnit,
    getUnitCount,
    clearSelection,
    hasSelection
  } = useRosterUnitSelection();

  useEffect(() => {
    if (roster.id && roster.factionId) {
      getFaction(roster.factionId).then(setFactionData);
    }
  }, [roster.id, roster.factionId, getFaction]);

  if (!roster.id) {
    return <Loader />;
  }

  const factionName = roster.faction?.name;
  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName || roster.factionId;

  const handleAddSelectedUnits = () => {
    selectedUnits.forEach(({ datasheet, modelCost }) => {
      addUnit(datasheet, modelCost);
    });

    showToast({
      type: 'success',
      title: 'Units Added',
      message: `Added ${selectedUnits.length} unit${selectedUnits.length === 1 ? '' : 's'} to roster`
    });

    navigate(`/rosters/${roster.id}/edit`);
  };

  return (
    <div className={`flex flex-col gap-4 ${hasSelection ? 'pb-20 md:pb-4' : ''}`}>
      {/* Mobile Back Button */}
      <div className="md:hidden">
        <Link
          to={`/rosters/${roster.id}/edit`}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
          aria-label="Back to Edit Roster"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Back to Roster</span>
        </Link>
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` },
            { label: 'Edit', path: `/rosters/${roster.id}/edit` },
            { label: 'Add Units', path: `/rosters/${roster.id}/add-units` }
          ]}
        />
      </div>

      <PageHeader title="Add Units" subtitle={subtitle} />

      {/* Selection Summary */}
      {hasSelection && (
        <>
          <Card
            padding="sm"
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {selectedUnits.length} unit{selectedUnits.length === 1 ? '' : 's'} selected
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Total: {totalSelectedPoints} pts
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={clearSelection}>
                  Clear Selection
                </Button>
                <Button size="sm" onClick={handleAddSelectedUnits}>
                  Add to Roster
                </Button>
              </div>
            </div>
          </Card>

          {/* Mobile Sticky Bottom Button */}
          <div className="fixed bottom-4 left-4 right-4 md:hidden z-10">
            <Button onClick={handleAddSelectedUnits} className="w-full shadow-lg">
              Add {selectedUnits.length} Unit{selectedUnits.length === 1 ? '' : 's'} (
              {totalSelectedPoints} pts)
            </Button>
          </div>
        </>
      )}

      {/* Units Browser */}
      <DatasheetBrowser
        datasheets={factionData?.datasheets || []}
        searchPlaceholder="Search by unit name..."
        emptyStateMessage="No units available for this faction."
        renderDatasheet={(datasheet) => (
          <DatasheetSelectionCard datasheet={datasheet} onAdd={addToSelection} />
        )}
      />
    </div>
  );
};

const AddRosterUnitsPage: React.FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Add Units">
      <RosterProvider rosterId={rosterId}>
        <AddRosterUnitsView />
      </RosterProvider>
    </AppLayout>
  );
};

export default AddRosterUnitsPage;
