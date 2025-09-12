import { useState, useMemo, useCallback } from 'react';
import { depot } from '@depot/core';

export interface SelectedUnit {
  datasheet: depot.Datasheet;
  modelCost: depot.ModelCost;
  id: string;
}

export interface UseRosterUnitSelectionResult {
  selectedUnits: SelectedUnit[];
  totalSelectedPoints: number;
  addToSelection: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  removeFromSelection: (unitId: string) => void;
  toggleSelection: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  isUnitSelected: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => boolean;
  clearSelection: () => void;
  hasSelection: boolean;
}

export const useRosterUnitSelection = (): UseRosterUnitSelectionResult => {
  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([]);

  const totalSelectedPoints = useMemo(() => {
    return selectedUnits.reduce(
      (total: number, unit) => total + parseInt(unit.modelCost.cost, 10),
      0
    );
  }, [selectedUnits]);

  const generateUnitId = useCallback((datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
    return `${datasheet.id}-${modelCost.cost}-${modelCost.description}`;
  }, []);

  const addToSelection = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      const unitId = generateUnitId(datasheet, modelCost);
      const newUnit: SelectedUnit = {
        datasheet,
        modelCost,
        id: unitId
      };

      setSelectedUnits((prev) => [...prev, newUnit]);
    },
    [generateUnitId]
  );

  const removeFromSelection = useCallback((unitId: string) => {
    setSelectedUnits((prev) => prev.filter((unit) => unit.id !== unitId));
  }, []);

  const toggleSelection = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      const unitId = generateUnitId(datasheet, modelCost);
      const existingIndex = selectedUnits.findIndex((unit) => unit.id === unitId);

      if (existingIndex >= 0) {
        removeFromSelection(unitId);
      } else {
        addToSelection(datasheet, modelCost);
      }
    },
    [selectedUnits, generateUnitId, addToSelection, removeFromSelection]
  );

  const isUnitSelected = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      const unitId = generateUnitId(datasheet, modelCost);
      return selectedUnits.some((unit) => unit.id === unitId);
    },
    [selectedUnits, generateUnitId]
  );

  const clearSelection = useCallback(() => {
    setSelectedUnits([]);
  }, []);

  const hasSelection = useMemo(() => {
    return selectedUnits.length > 0;
  }, [selectedUnits]);

  return {
    selectedUnits,
    totalSelectedPoints,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    isUnitSelected,
    clearSelection,
    hasSelection
  };
};
