import { useState, useMemo, useCallback } from 'react';
import type { depot } from '@depot/core';

export interface SelectedUnit {
  datasheet: depot.Datasheet;
  modelCost: depot.ModelCost;
  id: string;
}

export interface UseRosterUnitSelectionResult {
  selectedUnits: SelectedUnit[];
  totalSelectedPoints: number;
  addToSelection: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  removeLatestUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  getUnitCount: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => number;
  clearSelection: () => void;
}

export const useRosterUnitSelection = (): UseRosterUnitSelectionResult => {
  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([]);

  const totalSelectedPoints = useMemo(() => {
    return selectedUnits.reduce(
      (total: number, unit) => total + parseInt(unit.modelCost.cost, 10),
      0
    );
  }, [selectedUnits]);

  const addToSelection = useCallback((datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
    setSelectedUnits((prev) => [...prev, { datasheet, modelCost, id: crypto.randomUUID() }]);
  }, []);

  const removeLatestUnit = useCallback((datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
    setSelectedUnits((prev) => {
      // Find the last unit that matches the datasheet and model cost
      const matchingUnits = prev.filter(
        (unit) =>
          unit.datasheet.id === datasheet.id &&
          unit.modelCost.cost === modelCost.cost &&
          unit.modelCost.description === modelCost.description
      );

      if (matchingUnits.length === 0) return prev;

      // Remove the last matching unit
      const lastMatchingUnit = matchingUnits[matchingUnits.length - 1];
      return prev.filter((unit) => unit.id !== lastMatchingUnit.id);
    });
  }, []);

  const getUnitCount = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      return selectedUnits.filter(
        (unit) =>
          unit.datasheet.id === datasheet.id &&
          unit.modelCost.cost === modelCost.cost &&
          unit.modelCost.description === modelCost.description
      ).length;
    },
    [selectedUnits]
  );

  const clearSelection = useCallback(() => {
    setSelectedUnits([]);
  }, []);

  return {
    selectedUnits,
    totalSelectedPoints,
    addToSelection,
    removeLatestUnit,
    getUnitCount,
    clearSelection
  };
};
