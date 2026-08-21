import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import type { depot } from '@depot/core';

import { PageHeader, Breadcrumbs, Button, Card, Alert } from '@/components/ui';
import BackButton from '@/components/shared/back-button';
import { DatasheetComposition } from '@/components/shared/datasheet';
import WargearSelection from '@/components/shared/wargear-selection';
import ModelCostSelection from './model-cost-selection';
import WargearAbilitiesSelection from './wargear-abilities-selection';
import { parseLoadoutWargear } from '@depot/core/utils/wargear';
import { modelCostsForOrdinal } from '@depot/core/utils/model-costs';
import {
  getWargearAbilities,
  normalizeSelectedWargearAbilities
} from '@depot/core/utils/abilities';

export interface UnitEditSelection {
  selectedWargear: depot.Wargear[];
  selectedWargearAbilities: depot.Ability[];
  selectedModelCost?: depot.ModelCost;
}

interface UnitEditShellProps {
  /** CollectionUnit is structurally assignable to RosterUnit, so both work here. Key the shell by unit id so a new unit gets fresh state. */
  unit: depot.RosterUnit;
  testId: string;
  backTo: string;
  backLabel: string;
  breadcrumbs: { label: string; path: string }[];
  breadcrumbsTestId: string;
  title: string;
  subtitle?: string;
  headerTestId: string;
  saveButtonTestId: string;
  /** Cost rows offered for this unit; defaults to the first-copy bracket. */
  modelCosts?: depot.ModelCost[];
  /** Extra cards rendered at the top of the left column (e.g. collection build state). */
  beforeModelCost?: React.ReactNode;
  /** Extra cards rendered below the grid (e.g. roster enhancements/warlord). */
  afterGrid?: React.ReactNode;
  onSave: (selection: UnitEditSelection) => void | Promise<void>;
}

const UnitEditShell: React.FC<UnitEditShellProps> = ({
  unit,
  testId,
  backTo,
  backLabel,
  breadcrumbs,
  breadcrumbsTestId,
  title,
  subtitle,
  headerTestId,
  saveButtonTestId,
  modelCosts,
  beforeModelCost,
  afterGrid,
  onSave
}) => {
  const navigate = useNavigate();
  const availableModelCosts = modelCosts ?? modelCostsForOrdinal(unit.datasheet.modelCosts);

  const [selectedWargear, setSelectedWargear] = useState<depot.Wargear[]>(() => {
    if (unit.selectedWargear?.length) return unit.selectedWargear;
    if (!unit.datasheet.loadout || unit.datasheet.wargear.length === 0) return [];
    // Auto-select wargear based on loadout parsing
    const matchedIds = parseLoadoutWargear(unit.datasheet.loadout, unit.datasheet.wargear);
    return unit.datasheet.wargear.filter((w) => matchedIds.includes(w.id));
  });
  const [selectedModelCost, setSelectedModelCost] = useState<depot.ModelCost | undefined>(
    unit.modelCost
  );
  const [selectedWargearAbilities, setSelectedWargearAbilities] = useState<depot.Ability[]>(() =>
    normalizeSelectedWargearAbilities(unit.selectedWargearAbilities, unit.datasheet.abilities)
  );

  const toggleWargear = (wargear: depot.Wargear, selected: boolean) =>
    setSelectedWargear((prev) =>
      selected
        ? prev.some((existing) => existing.id === wargear.id)
          ? prev
          : [...prev, wargear]
        : prev.filter((existing) => existing.id !== wargear.id)
    );

  const options = unit.datasheet.options ?? [];
  const shouldShowWargearOptions =
    options.length > 0 &&
    !(options.length === 1 && options[0].description.toLowerCase().trim() === 'none');

  const wargearAbilities = useMemo(
    () => getWargearAbilities(unit.datasheet.abilities ?? []),
    [unit.datasheet.abilities]
  );

  const handleSave = () =>
    void onSave({ selectedWargear, selectedWargearAbilities, selectedModelCost });

  return (
    <div className="flex flex-col gap-4" data-testid={testId}>
      <BackButton to={backTo} label={backLabel} testId="mobile-back-button" className="md:hidden" />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs items={breadcrumbs} data-testid={breadcrumbsTestId} />
      </div>

      <PageHeader
        title={title}
        subtitle={subtitle}
        action={{
          icon: <Save size={16} />,
          onClick: handleSave,
          ariaLabel: 'Save changes',
          testId: saveButtonTestId
        }}
        data-testid={headerTestId}
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          {beforeModelCost}

          {/* Model Cost Selection - only show if there are multiple options */}
          {availableModelCosts.length > 1 && (
            <Card data-testid="model-cost-section">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-foreground">Unit Size</h3>
                <p className="text-sm text-muted">Choose the number of models for this unit</p>
                <ModelCostSelection
                  modelCosts={availableModelCosts}
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
        </div>

        <div className="flex flex-col gap-4">
          {/* Wargear Selection */}
          <Card data-testid="wargear-section">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Wargear</h3>
              <p className="text-sm text-muted">Select wargear options for this unit</p>
              <WargearSelection
                wargear={unit.datasheet.wargear}
                selectedWargear={selectedWargear}
                onSelectionChange={toggleWargear}
              />
            </div>
          </Card>

          {/* Wargear Abilities */}
          {wargearAbilities.length > 0 ? (
            <Card data-testid="wargear-abilities-section">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-foreground">Wargear Abilities</h3>
                <p className="text-sm text-muted">
                  Toggle wargear-linked abilities that apply to this unit&apos;s chosen loadout.
                </p>
                <WargearAbilitiesSelection
                  abilities={wargearAbilities}
                  selected={selectedWargearAbilities}
                  onChange={setSelectedWargearAbilities}
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      {afterGrid}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4" data-testid="action-buttons">
        <Button variant="secondary" onClick={() => navigate(backTo)} data-testid="cancel-button">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="save-button">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UnitEditShell;
