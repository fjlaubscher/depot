import React, { useState, useMemo } from 'react';
import { useNavigate } from '@/lib/navigation';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { Alert, Button, SectionHeader } from '@/components/ui';
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
  documentTitle: string;
  title: string;
  subtitle?: string;
  /** Cost rows offered for this unit; defaults to the first-copy bracket. */
  modelCosts?: depot.ModelCost[];
  /** Extra content rendered above unit size (e.g. collection build state). */
  beforeModelCost?: React.ReactNode;
  /** Extra content rendered at the end (e.g. roster enhancements/warlord). */
  afterGrid?: React.ReactNode;
  onSave: (selection: UnitEditSelection) => void | Promise<void>;
}

const UnitEditShell: React.FC<UnitEditShellProps> = ({
  unit,
  testId,
  backTo,
  backLabel,
  documentTitle,
  title,
  subtitle,
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

  const currentPoints = parseInt((selectedModelCost ?? unit.modelCost).cost, 10) || 0;
  const startingPoints = parseInt(unit.modelCost.cost, 10) || 0;
  const delta = currentPoints - startingPoints;

  return (
    <AppLayout
      title={documentTitle}
      back={{ to: backTo, label: backLabel }}
      heading={{ title, subtitle }}
      footer={
        <>
          <div className="flex-1" data-testid="unit-edit-points">
            <div className="font-mono text-base leading-none font-bold text-foreground">
              {currentPoints} PTS
            </div>
            <div className="mt-0.5 font-mono text-[9px] font-medium text-success-fg">
              {delta === 0 ? 'NO CHANGE' : `${delta > 0 ? '+' : ''}${delta} PTS`}
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(backTo)} data-testid="cancel-button">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="save-button">
            Apply
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3" data-testid={testId}>
        {beforeModelCost}

        {/* Unit size — only meaningful when the datasheet offers more than one bracket */}
        {availableModelCosts.length > 1 && (
          <section className="flex flex-col gap-1.5" data-testid="model-cost-section">
            <SectionHeader title="Unit size" />
            <ModelCostSelection
              modelCosts={availableModelCosts}
              selectedModelCost={selectedModelCost || unit.modelCost}
              onModelCostChange={setSelectedModelCost}
            />
          </section>
        )}

        <DatasheetComposition
          composition={unit.datasheet.unitComposition}
          loadout={unit.datasheet.loadout}
          transport={unit.datasheet.transport}
          data-testid="unit-composition"
        />

        <section className="flex flex-col gap-1.5" data-testid="wargear-section">
          <SectionHeader title="Wargear" />
          <WargearSelection
            wargear={unit.datasheet.wargear}
            selectedWargear={selectedWargear}
            onSelectionChange={toggleWargear}
          />
        </section>

        {wargearAbilities.length > 0 ? (
          <section className="flex flex-col gap-1.5" data-testid="wargear-abilities-section">
            <SectionHeader title="Wargear abilities" />
            <WargearAbilitiesSelection
              abilities={wargearAbilities}
              selected={selectedWargearAbilities}
              onChange={setSelectedWargearAbilities}
            />
          </section>
        ) : null}

        {shouldShowWargearOptions && (
          <Alert variant="info" title="Wargear options" data-testid="wargear-options-section">
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

        {afterGrid}
      </div>
    </AppLayout>
  );
};

export default UnitEditShell;
