import React, { useMemo, useState } from 'react';
import { depot } from '@depot/core';
import { CollapsibleSection, Search, Filters, Button, Card, SelectField } from '@/components/ui';
import { Plus } from 'lucide-react';
import { groupDatasheetsByRole } from '@/utils/datasheet';
import useDebounce from '@/hooks/use-debounce';

interface DatasheetAddCardProps {
  datasheet: depot.Datasheet;
  onAddUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
}

const DatasheetAddCard: React.FC<DatasheetAddCardProps> = ({ datasheet, onAddUnit }) => {
  const [selectedModelCostIndex, setSelectedModelCostIndex] = useState(0);
  const selectedModelCost = datasheet.modelCosts[selectedModelCostIndex];

  const modelCostOptions = datasheet.modelCosts.map((cost, index) => ({
    value: index.toString(),
    label: `${cost.description} - ${cost.cost} pts`
  }));

  return (
    <Card padding="sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{datasheet.name}</h4>

          {datasheet.modelCosts.length > 1 ? (
            <SelectField
              value={selectedModelCostIndex.toString()}
              onChange={(e) => setSelectedModelCostIndex(parseInt(e.target.value, 10))}
              options={modelCostOptions}
            />
          ) : (
            selectedModelCost && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedModelCost.description} - {selectedModelCost.cost} pts
              </p>
            )
          )}
        </div>

        <Button
          size="sm"
          onClick={() => {
            if (selectedModelCost) {
              onAddUnit(datasheet, selectedModelCost);
            }
          }}
          disabled={!selectedModelCost}
        >
          <Plus size={16} className="mr-1" />
          Add
        </Button>
      </div>
    </Card>
  );
};

interface AddUnitPanelProps {
  datasheets: depot.Datasheet[];
  onAddUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const AddUnitPanel: React.FC<AddUnitPanelProps> = ({
  datasheets,
  onAddUnit,
  isExpanded,
  onToggle
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  const groupedDatasheets = useMemo(() => {
    const filteredDatasheets = debouncedQuery
      ? datasheets.filter((ds) => ds.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      : datasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, debouncedQuery]);

  const sortedRoleKeys = useMemo(() => {
    return Object.keys(groupedDatasheets).sort();
  }, [groupedDatasheets]);

  const shouldExpandSection = useMemo(() => {
    if (debouncedQuery) {
      const expandedSections: { [key: string]: boolean } = {};
      sortedRoleKeys.forEach((key) => {
        expandedSections[key] = groupedDatasheets[key].length > 0;
      });
      return expandedSections;
    }
    return {};
  }, [debouncedQuery, sortedRoleKeys, groupedDatasheets]);

  const getDefaultModelCost = (datasheet: depot.Datasheet): depot.ModelCost | undefined => {
    return datasheet.modelCosts.length > 0 ? datasheet.modelCosts[0] : undefined;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-t-lg cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span>Add Units to Roster</span>
          <Plus className={`transition-transform ${isExpanded ? 'rotate-45' : ''}`} size={20} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4">
          <Filters showClear={!!query} onClear={() => setQuery('')}>
            <Search label="Search available units" value={query} onChange={setQuery} />
          </Filters>

          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
            {sortedRoleKeys.map((role) =>
              groupedDatasheets[role].length ? (
                <CollapsibleSection
                  key={`${role}-${!!debouncedQuery}`}
                  title={role.toUpperCase()}
                  defaultExpanded={shouldExpandSection[role] || false}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex flex-col gap-2">
                    {groupedDatasheets[role].map((datasheet) => (
                      <DatasheetAddCard
                        key={datasheet.id}
                        datasheet={datasheet}
                        onAddUnit={onAddUnit}
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              ) : null
            )}
          </div>

          {Object.keys(groupedDatasheets).every((key) => groupedDatasheets[key].length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No units found matching your search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddUnitPanel;
