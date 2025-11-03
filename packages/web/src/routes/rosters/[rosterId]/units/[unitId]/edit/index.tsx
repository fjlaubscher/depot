import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import type { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';

import AppLayout from '@/components/layout';
import {
  PageHeader,
  Breadcrumbs,
  Button,
  Card,
  Alert,
  ErrorState,
  PageHeaderSkeleton,
  SkeletonCard
} from '@/components/ui';
import WargearSelectionContainer from './_components/wargear-selection-container';
import ModelCostSelection from './_components/model-cost-selection';
import EnhancementSelection from './_components/enhancement-selection';
import WarlordSelection from './_components/warlord-selection';
import { BackButton, DatasheetComposition } from '@/components/shared';
import { parseLoadoutWargear } from '@/utils/wargear';
import { getRosterFactionName } from '@/utils/roster';

const EditRosterUnitView: React.FC = () => {
  const {
    state: roster,
    updateUnitWargear,
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

  // Track which unit we've initialized to avoid resetting user selections
  const initializedUnitRef = useRef<string | null>(null);

  // State for form values
  const [selectedWargear, setSelectedWargear] = useState<depot.Wargear[]>([]);
  const [selectedModelCost, setSelectedModelCost] = useState<depot.ModelCost | undefined>(
    unit?.modelCost
  );
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>(() => {
    return roster.enhancements.filter((e) => e.unitId === unitId).map((e) => e.enhancement.id);
  });
  const [isWarlord, setIsWarlord] = useState(() => roster.warlordUnitId === unitId);

  // Initialize wargear only when switching to a new unit
  useEffect(() => {
    if (unit && unitId && initializedUnitRef.current !== unitId) {
      // Calculate smart wargear selection
      let wargearToSelect: depot.Wargear[] = [];

      if (unit.selectedWargear && unit.selectedWargear.length > 0) {
        // Use existing selections if they exist
        wargearToSelect = unit.selectedWargear;
      } else if (unit.datasheet.loadout && unit.datasheet.wargear.length > 0) {
        // Auto-select wargear based on loadout parsing
        const matchedLines = parseLoadoutWargear(unit.datasheet.loadout, unit.datasheet.wargear);
        wargearToSelect = unit.datasheet.wargear.filter((w) => matchedLines.includes(w.line));
      }

      setSelectedWargear(wargearToSelect);
      setSelectedModelCost(unit.modelCost);
      const unitEnhancements = roster.enhancements
        .filter((e) => e.unitId === unitId)
        .map((e) => e.enhancement.id);
      setSelectedEnhancements(unitEnhancements);
      setIsWarlord(roster.warlordUnitId === unitId);

      // Mark this unit as initialized
      initializedUnitRef.current = unitId;
    }
  }, [unitId, unit, roster.enhancements, roster.warlordUnitId]);

  // Memoized calculations (must be before early returns to maintain hook order)
  const shouldShowWargearOptions = useMemo(() => {
    if (!unit?.datasheet.options) return false;
    if (unit.datasheet.options.length === 0) return false;
    if (
      unit.datasheet.options.length === 1 &&
      unit.datasheet.options[0].description.toLowerCase().trim() === 'none'
    ) {
      return false;
    }
    return true;
  }, [unit?.datasheet.options]);

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

  const handleSave = () => {
    if (!unitId) return;

    try {
      // Update unit wargear
      updateUnitWargear(unitId, selectedWargear);

      // Handle enhancements - first remove existing ones for this unit
      const existingEnhancements = roster.enhancements.filter((e) => e.unitId === unitId);
      existingEnhancements.forEach((e) => removeEnhancement(e.enhancement.id));

      // Then apply new enhancements
      selectedEnhancements.forEach((enhancementId) => {
        const enhancement = roster.detachment?.enhancements.find((e) => e.id === enhancementId);
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

      navigate(`/rosters/${rosterId}/edit`);
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
    <div className="flex flex-col gap-4" data-testid="edit-unit-form">
      <BackButton
        to={`/rosters/${rosterId}/edit`}
        label="Back to Roster"
        testId="mobile-back-button"
        className="md:hidden"
      />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` },
            { label: 'Edit', path: `/rosters/${roster.id}/edit` },
            { label: unit.datasheet.name, path: `/rosters/${roster.id}/units/${unit.id}/edit` }
          ]}
          data-testid="edit-unit-breadcrumbs"
        />
      </div>

      <PageHeader
        title="Edit Unit"
        subtitle={subtitle}
        action={{
          icon: <Save size={16} />,
          onClick: handleSave,
          ariaLabel: 'Save changes',
          testId: 'save-unit-button'
        }}
        data-testid="edit-unit-header"
      />

      <div className="flex flex-col gap-4">
        {/* Model Cost Selection - only show if there are multiple options */}
        {unit.datasheet.modelCosts.length > 1 && (
          <Card data-testid="model-cost-section">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Unit Size</h3>
              <p className="text-sm text-muted">Choose the number of models for this unit</p>
              <ModelCostSelection
                unit={unit}
                selectedModelCost={selectedModelCost || unit.modelCost}
                onModelCostChange={setSelectedModelCost}
              />
            </div>
          </Card>
        )}

        {/* Unit Composition */}
        <DatasheetComposition
          composition={unit.datasheet.unitComposition}
          loadout={unit.datasheet.loadout}
          transport={unit.datasheet.transport}
          data-testid="unit-composition"
        />

        {/* Wargear Options */}
        {shouldShowWargearOptions && (
          <Alert variant="info" title="Wargear Options" data-testid="wargear-options-section">
            <ul className="space-y-2 list-disc pl-4 text-sm">
              {unit.datasheet.options.map((option, index) => (
                <li
                  key={`${option.line}-${index}`}
                  className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-1"
                  dangerouslySetInnerHTML={{ __html: option.description }}
                  data-testid={`option-${option.line}`}
                />
              ))}
            </ul>
          </Alert>
        )}

        {/* Wargear Selection */}
        <Card data-testid="wargear-section">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">Wargear</h3>
            <p className="text-sm text-muted">Select wargear options for this unit</p>
            <WargearSelectionContainer
              unit={unit}
              selectedWargear={selectedWargear}
              onWargearChange={setSelectedWargear}
            />
          </div>
        </Card>

        {/* Enhancement Selection for Characters */}
        {isCharacter && (
          <Card data-testid="enhancement-section">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Enhancements</h3>
              <p className="text-sm text-muted">Select enhancements for this character</p>
              <EnhancementSelection
                unit={unit}
                roster={roster}
                selectedEnhancements={selectedEnhancements}
                onEnhancementChange={setSelectedEnhancements}
              />
            </div>
          </Card>
        )}

        {/* Warlord Nomination for Characters */}
        {isCharacter && (
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
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4" data-testid="action-buttons">
          <Button
            variant="secondary"
            onClick={() => navigate(`/rosters/${rosterId}/edit`)}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="save-button">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const EditRosterUnitPage: React.FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  if (!rosterId) {
    return (
      <AppLayout title="Edit Unit">
        <ErrorState
          title="Invalid Roster"
          message="The roster ID provided is invalid."
          data-testid="invalid-roster-error"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Unit">
      <RosterProvider rosterId={rosterId}>
        <EditRosterUnitView />
      </RosterProvider>
    </AppLayout>
  );
};

export default EditRosterUnitPage;
