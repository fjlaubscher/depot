import React from 'react';
import { Button, Card } from '@/components/ui';
import { SelectedUnit } from '@/hooks/use-roster-unit-selection';

interface UnitSelectionSummaryProps {
  selectedUnits: SelectedUnit[];
  totalSelectedPoints: number;
  onAddToRoster: () => void;
  onClearSelection: () => void;
}

export const UnitSelectionSummary: React.FC<UnitSelectionSummaryProps> = ({
  selectedUnits,
  totalSelectedPoints,
  onAddToRoster,
  onClearSelection
}) => {
  return (
    <>
      {/* Desktop Summary */}
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
            <Button size="sm" variant="secondary" onClick={onClearSelection}>
              Clear Selection
            </Button>
            <Button size="sm" onClick={onAddToRoster}>
              Add to Roster
            </Button>
          </div>
        </div>
      </Card>

      {/* Mobile Sticky Bottom Button */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-10">
        <Button onClick={onAddToRoster} className="w-full shadow-lg">
          Add {selectedUnits.length} Unit{selectedUnits.length === 1 ? '' : 's'} (
          {totalSelectedPoints} pts)
        </Button>
      </div>
    </>
  );
};
