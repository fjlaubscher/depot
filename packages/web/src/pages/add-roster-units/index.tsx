import type { FC } from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs } from '@/components/ui';
import { BackButton, DatasheetBrowser, DatasheetSelectionCard } from '@/components/shared';
import SelectionSummary from './components/selection-summary';
import type { SelectionGroup } from './components/selection-summary';

const AddRosterUnitsView: FC = () => {
  const { state: roster, addUnit } = useRoster();
  const { state: appState, getFaction } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [factionData, setFactionData] = useState<depot.Faction | null>(null);

  const {
    selectedUnits,
    totalSelectedPoints,
    addToSelection,
    removeLatestUnit,
    getUnitCount,
    clearSelection
  } = useRosterUnitSelection();

  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const scrollToTop = useCallback(() => {
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollContainer]);

  const aggregatedSelection = useMemo<SelectionGroup[]>(() => {
    const groups = new Map<string, SelectionGroup>();

    selectedUnits.forEach((unit) => {
      const key = `${unit.datasheet.id}-${unit.modelCost.line}`;
      const existing = groups.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, {
          count: 1,
          datasheet: unit.datasheet,
          modelCost: unit.modelCost
        });
      }
    });

    return Array.from(groups.values());
  }, [selectedUnits]);

  const incrementUnit = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      addToSelection(datasheet, modelCost);
    },
    [addToSelection]
  );

  const decrementUnit = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      removeLatestUnit(datasheet, modelCost);
    },
    [removeLatestUnit]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const resolveScrollContainer = () => {
      const sentinel = topSentinelRef.current;
      return (document.getElementById('app-content') ??
        sentinel?.closest('main')) as HTMLElement | null;
    };

    const existingContainer = resolveScrollContainer();
    if (existingContainer) {
      setScrollContainer(existingContainer);
      return undefined;
    }

    let animationFrame: number | null = null;

    const ensureContainer = () => {
      const container = resolveScrollContainer();
      if (container) {
        setScrollContainer(container);
        animationFrame = null;
      } else {
        animationFrame = window.requestAnimationFrame(ensureContainer);
      }
    };

    animationFrame = window.requestAnimationFrame(ensureContainer);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!scrollContainer) {
      return undefined;
    }

    const handleScroll = () => {
      setIsAtTop(scrollContainer.scrollTop <= 1);
    };

    handleScroll();
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainer]);

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
    <div className="flex flex-col">
      <BackButton
        to={`/rosters/${roster.id}/edit`}
        label="Back to Roster"
        ariaLabel="Back to Edit Roster"
        className="md:hidden mb-4"
      />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block md:mb-4">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` },
            { label: 'Edit', path: `/rosters/${roster.id}/edit` },
            { label: 'Add Units', path: `/rosters/${roster.id}/add-units` }
          ]}
        />
      </div>

      <PageHeader title="Add Units" subtitle={subtitle} className="mb-4" />

      <div ref={topSentinelRef} className="h-px" aria-hidden="true" />

      <SelectionSummary
        groups={aggregatedSelection}
        selectedUnitsCount={selectedUnits.length}
        totalPoints={totalSelectedPoints}
        onClear={clearSelection}
        onConfirm={handleAddSelectedUnits}
        onIncrement={incrementUnit}
        onDecrement={decrementUnit}
        isExpanded={isAtTop}
        className="mb-4"
        onRequestExpand={scrollToTop}
      />

      {/* Units Browser */}
      <div className="mb-4">
        <DatasheetBrowser
          datasheets={filteredDatasheets}
          searchPlaceholder="Search by unit name..."
          emptyStateMessage="No units available for this faction."
          renderDatasheet={(datasheet) => (
            <DatasheetSelectionCard
              datasheet={datasheet}
              onAdd={incrementUnit}
              getUnitCount={getUnitCount}
            />
          )}
        />
      </div>
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
