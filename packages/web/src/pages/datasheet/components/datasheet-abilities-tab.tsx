import React, { useMemo, useState } from 'react';
import type { depot } from '@depot/core';

// components
import Grid from '@/components/ui/grid';
import Filters from '@/components/ui/filters';
import Search from '@/components/ui/search';
import SelectField from '@/components/ui/select-field';
import ExpandableAbilityCard from './expandable-ability-card';

// hooks
import useDebounce from '@/hooks/use-debounce';

// utils
import { sortByName } from '@/utils/array';
import { categorizeAbilities } from '../utils/abilities';

interface DatasheetAbilitiesTabProps {
  abilities: depot.Ability[];
}

const DatasheetAbilitiesTab: React.FC<DatasheetAbilitiesTabProps> = ({ abilities }) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  // Only show referenced abilities (Core/Faction) in this tab
  const referencedAbilities = useMemo(() => {
    const { referenced } = categorizeAbilities(abilities);
    return referenced;
  }, [abilities]);

  // Get unique ability types for the filter
  const abilityTypes = useMemo(() => {
    const types = referencedAbilities
      .map((ability) => ability.type)
      .filter((type, index, self) => self.indexOf(type) === index)
      .sort();
    return types;
  }, [referencedAbilities]);

  // Create type options for the select field
  const typeOptions = useMemo(() => {
    return [
      { value: '', label: 'All Types' },
      ...abilityTypes.map((type) => ({ value: type, label: type }))
    ];
  }, [abilityTypes]);

  const filteredAbilities = useMemo(() => {
    let filtered = referencedAbilities;

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter((ability) => ability.type === selectedType);
    }

    // Filter by search query (search name only since we removed legend)
    if (debouncedQuery) {
      const searchTerm = debouncedQuery.toLowerCase();
      filtered = filtered.filter((ability) => ability.name.toLowerCase().includes(searchTerm));
    }

    return sortByName(filtered) as depot.Ability[];
  }, [referencedAbilities, selectedType, debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setSelectedType('');
  };

  const showClearButton = !!selectedType || !!query;

  if (referencedAbilities.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-abilities">
        <p className="text-gray-500 dark:text-gray-400">
          No core abilities associated with this datasheet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="datasheet-abilities-tab">
      <Filters showClear={showClearButton} onClear={handleClear}>
        <Search
          label="Search by name"
          value={query}
          onChange={setQuery}
          placeholder="Search abilities..."
        />
        <SelectField
          name="type"
          label="Filter by type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={typeOptions}
        />
      </Filters>

      {filteredAbilities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No abilities found matching your search criteria.
          </p>
        </div>
      ) : (
        <Grid>
          {filteredAbilities.map((ability, index) => (
            <ExpandableAbilityCard key={ability.id || `ability-${index}`} ability={ability} />
          ))}
        </Grid>
      )}
    </div>
  );
};

export default DatasheetAbilitiesTab;
