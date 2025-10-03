import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Card } from '@/components/ui';
import { BackButton, DatasheetBrowser, DatasheetSelectionCard } from '@/components/shared';

const AddRosterUnitsView: FC = () => {
  const { state: roster, addUnit } = useRoster();
  const { state: appState, getFaction } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [factionData, setFactionData] = useState<depot.Faction | null>(null);

  const { selectedUnits, totalSelectedPoints, addToSelection, clearSelection, hasSelection } =
    useRosterUnitSelection();

  useEffect(() => {
    if (roster.id && (roster.factionSlug || roster.factionId)) {
      const key = roster.factionSlug || roster.factionId;
      getFaction(key).then(setFactionData);
    }
  }, [roster.id, roster.factionSlug, roster.factionId, getFaction]);

  const showLegends = appState.settings?.showLegends ?? false;
  const showForgeWorld = appState.settings?.showForgeWorld ?? false;

  const filteredDatasheets = useMemo(() => {
    if (!factionData) {
      return [];
    }

    return factionData.datasheets.filter((sheet) => {
      if (!showLegends && sheet.isLegends) {
        return false;
      }

      if (!showForgeWorld && sheet.isForgeWorld) {
        return false;
      }

      return true;
    });
  }, [factionData, showLegends, showForgeWorld]);

  if (!roster.id) {
    return <Loader />;
  }

  const factionName = roster.faction?.name;
  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName || roster.factionSlug || roster.factionId;

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
    <div className="flex flex-col gap-4">
      <BackButton
        to={`/rosters/${roster.id}/edit`}
        label="Back to Roster"
        ariaLabel="Back to Edit Roster"
        className="md:hidden"
      />

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

      {/* Sticky Selection Summary */}
      {hasSelection && (
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-3 mb-4">
          <Card
            padding="sm"
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
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
                  Add
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Units Browser */}
      <DatasheetBrowser
        datasheets={filteredDatasheets}
        searchPlaceholder="Search by unit name..."
        emptyStateMessage="No units available for this faction."
        renderDatasheet={(datasheet) => (
          <DatasheetSelectionCard datasheet={datasheet} onAdd={addToSelection} />
        )}
      />
    </div>
  );
};

const AddRosterUnitsPage: FC = () => {
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
