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
  removeLatestUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  getUnitCount: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => number;
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

  const generateUnitId = useCallback(() => {
    return `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addToSelection = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      const unitId = generateUnitId();
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

  const hasSelection = useMemo(() => {
    return selectedUnits.length > 0;
  }, [selectedUnits]);

  return {
    selectedUnits,
    totalSelectedPoints,
    addToSelection,
    removeFromSelection,
    removeLatestUnit,
    getUnitCount,
    clearSelection,
    hasSelection
  };
};
