import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useDocumentTitle } from '@/hooks/use-document-title';

import AppLayout from '@/components/layout';
import { PageHeader, Card, ErrorState, PageHeaderSkeleton, SkeletonCard } from '@/components/ui';
import UnitEditShell from '@/components/shared/unit-edit/unit-edit-shell';
import type { UnitEditSelection } from '@/components/shared/unit-edit/unit-edit-shell';
import EnhancementSelection from './_components/enhancement-selection';
import WarlordSelection from './_components/warlord-selection';
import { getRosterFactionName } from '@depot/core/utils/roster';
import { getEligibleEnhancements } from '@depot/core/utils/roster-legality';

const EditRosterUnitView: React.FC = () => {
  const {
    state: roster,
    updateUnitWargear,
    updateUnitWargearAbilities,
    updateUnitModelCost,
    applyEnhancement,
    removeEnhancement,
    setWarlord
  } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { rosterId, unitId } = useParams<{ rosterId: string; unitId: string }>();

  // Find the unit we're editing
  const unit = roster.units.find((u) => u.id === unitId);
  const unitHash = unit ? `#unit-${unit.id}` : '';

  // Track which unit we've initialized to avoid resetting user selections
  const initializedUnitRef = useRef<string | null>(null);

  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>(() => {
    return roster.enhancements.filter((e) => e.unitId === unitId).map((e) => e.enhancement.id);
  });
  const [isWarlord, setIsWarlord] = useState(() => roster.warlordUnitId === unitId);

  // Initialize enhancements/warlord only when switching to a new unit
  useEffect(() => {
    if (unit && unitId && initializedUnitRef.current !== unitId) {
      const unitEnhancements = roster.enhancements
        .filter((e) => e.unitId === unitId)
        .map((e) => e.enhancement.id);
      setSelectedEnhancements(unitEnhancements);
      setIsWarlord(roster.warlordUnitId === unitId);

      initializedUnitRef.current = unitId;
    }
  }, [unitId, unit, roster.enhancements, roster.warlordUnitId]);

  const pageTitle = unit?.datasheet?.name
    ? `${unit.datasheet.name} - Edit Roster Unit`
    : 'Edit Roster Unit';

  useDocumentTitle(pageTitle);

  // Loading state while roster loads
  if (!roster.id) {
    return (
      <div className="flex flex-col gap-4" data-testid="edit-unit-loading">
        <PageHeaderSkeleton />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Error state if unit not found
  if (!unit) {
    return (
      <div className="flex flex-col gap-4" data-testid="edit-unit-not-found">
        <PageHeader title="Edit Unit" />
        <ErrorState
          title="Unit Not Found"
          message="The unit you're trying to edit could not be found."
          showRetry={false}
          homeUrl={`/rosters/${rosterId}/edit`}
        />
      </div>
    );
  }

  const factionName = getRosterFactionName(roster);
  const isCharacter = unit.datasheet.keywords.some((k) =>
    k.keyword.toLowerCase().includes('character')
  );
  const eligibleEnhancements = getEligibleEnhancements(unit, roster);

  const handleSave = ({
    selectedWargear,
    selectedWargearAbilities,
    selectedModelCost
  }: UnitEditSelection) => {
    if (!unitId) return;

    try {
      // Update unit wargear
      updateUnitWargear(unitId, selectedWargear);
      updateUnitWargearAbilities(unitId, selectedWargearAbilities);

      // Handle enhancements - first remove existing ones for this unit
      const existingEnhancements = roster.enhancements.filter((e) => e.unitId === unitId);
      existingEnhancements.forEach((e) => removeEnhancement(e.enhancement.id));

      // Then apply new enhancements
      selectedEnhancements.forEach((enhancementId) => {
        const enhancement = eligibleEnhancements.find((e) => e.id === enhancementId);
        if (enhancement) {
          applyEnhancement(enhancement, unitId);
        }
      });

      // Update model cost if changed
      if (selectedModelCost && selectedModelCost !== unit?.modelCost) {
        updateUnitModelCost(unitId, selectedModelCost);
      }

      if (isWarlord) {
        setWarlord(unitId);
      } else if (roster.warlordUnitId === unitId) {
        setWarlord(null);
      }

      showToast({
        type: 'success',
        title: 'Unit Updated',
        message: 'Unit configuration has been saved successfully.'
      });

      navigate(`/rosters/${rosterId}/edit${unitHash}`);
    } catch (error) {
      console.error('Failed to save unit changes:', error);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save unit changes. Please try again.'
      });
    }
  };

  const subtitle = factionName ? `${factionName} • ${unit.datasheet.name}` : unit.datasheet.name;

  return (
    <UnitEditShell
      unit={unit}
      unitId={unitId}
      testId="edit-unit-form"
      backTo={`/rosters/${rosterId}/edit${unitHash}`}
      backLabel="Back to Roster"
      breadcrumbs={[
        { label: 'Rosters', path: '/rosters' },
        { label: roster.name, path: `/rosters/${roster.id}/edit${unitHash}` },
        { label: 'Edit', path: `/rosters/${roster.id}/edit${unitHash}` },
        { label: unit.datasheet.name, path: `/rosters/${roster.id}/units/${unit.id}/edit` }
      ]}
      breadcrumbsTestId="edit-unit-breadcrumbs"
      title="Edit Unit"
      subtitle={subtitle}
      headerTestId="edit-unit-header"
      saveButtonTestId="save-unit-button"
      afterGrid={
        <>
          {isCharacter || eligibleEnhancements.length > 0 ? (
            <Card data-testid="enhancement-section">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-foreground">Enhancements</h3>
                <p className="text-sm text-muted">
                  {isCharacter
                    ? 'Select one enhancement for this character'
                    : 'Select one Upgrade for this unit'}
                </p>
                <EnhancementSelection
                  enhancements={eligibleEnhancements}
                  selectedEnhancements={selectedEnhancements}
                  onEnhancementChange={setSelectedEnhancements}
                />
              </div>
            </Card>
          ) : null}

          {isCharacter ? (
            <Card data-testid="warlord-section">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-foreground">Warlord</h3>
                <p className="text-sm text-muted">Nominate this character as your warlord</p>
                <WarlordSelection
                  unit={unit}
                  roster={roster}
                  isWarlord={isWarlord}
                  onWarlordChange={setIsWarlord}
                />
              </div>
            </Card>
          ) : null}
        </>
      }
      onSave={handleSave}
    />
  );
};

const EditRosterUnitPage: React.FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  if (!rosterId) {
    return (
      <AppLayout title="Edit Roster Unit">
        <ErrorState
          title="Invalid Roster"
          message="The roster ID provided is invalid."
          data-testid="invalid-roster-error"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Roster Unit">
      <RosterProvider rosterId={rosterId}>
        <EditRosterUnitView />
      </RosterProvider>
    </AppLayout>
  );
};

export default EditRosterUnitPage;
