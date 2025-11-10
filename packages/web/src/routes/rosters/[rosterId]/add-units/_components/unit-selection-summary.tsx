import type { FC } from 'react';
import { Button, Card } from '@/components/ui';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';

interface UnitSelectionSummaryProps {
  selectedUnits: SelectedUnit[];
  totalSelectedPoints: number;
  onAddToRoster: () => void;
  onClearSelection: () => void;
}

export const UnitSelectionSummary: FC<UnitSelectionSummaryProps> = ({
  selectedUnits,
  totalSelectedPoints,
  onAddToRoster,
  onClearSelection
}) => {
  return (
    <>
      {/* Desktop Summary */}
      <Card padding="sm" className="surface-info border-info">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-info-strong">
              {selectedUnits.length} unit{selectedUnits.length === 1 ? '' : 's'} selected
            </p>
            <p className="text-sm text-info">Total: {totalSelectedPoints} pts</p>
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
