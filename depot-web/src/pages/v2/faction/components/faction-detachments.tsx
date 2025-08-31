import React, { useMemo, useState } from 'react';
import { depot } from 'depot-core';

// UI Components
import Grid from '@/components/ui/grid';
import SelectField from '@/components/ui/select-field';
import Search from '@/components/ui/search';
import Filters from '@/components/ui/filters';
import DetachmentAbilityCard from './detachment-ability-card';

// Hooks
import useDebounce from '@/hooks/use-debounce';
import useSelect from '@/hooks/use-select';

// Utils
import {
  groupDetachmentAbilitiesByDetachment,
  filterDetachmentAbilities,
  getUniqueDetachmentTypes,
  isGroupedDataEmpty
} from '@/utils/detachment';

interface FactionDetachmentsProps {
  detachmentAbilities: depot.DetachmentAbility[];
}

const FactionDetachments: React.FC<FactionDetachmentsProps> = ({ detachmentAbilities }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const detachmentTypes = useMemo(
    () => getUniqueDetachmentTypes(detachmentAbilities),
    [detachmentAbilities]
  );

  const { description: detachment, value, onChange, options } = useSelect(detachmentTypes);

  const groupedDetachmentAbilities = useMemo(() => {
    const filteredAbilities = filterDetachmentAbilities(
      detachmentAbilities,
      debouncedQuery,
      detachment
    );
    return groupDetachmentAbilitiesByDetachment(filteredAbilities);
  }, [detachmentAbilities, debouncedQuery, detachment]);

  const isEmpty = useMemo(
    () => isGroupedDataEmpty(groupedDetachmentAbilities),
    [groupedDetachmentAbilities]
  );

  return (
    <div className="space-y-6">
      <Filters
        showClear={!!detachment || !!query}
        onClear={() => {
          setQuery('');
          onChange(0);
        }}
      >
        <Search label="Search by name" value={query} onChange={setQuery} />
        <SelectField
          name="detachment"
          value={value}
          label="Filter by detachment"
          onChange={onChange}
          options={options}
        />
      </Filters>

      {Object.keys(groupedDetachmentAbilities).map((key) =>
        groupedDetachmentAbilities[key].length > 0 ? (
          <div key={key} className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{key}</h2>
            </div>
            <Grid>
              {groupedDetachmentAbilities[key].map((ability) => (
                <DetachmentAbilityCard key={ability.id} ability={ability} />
              ))}
            </Grid>
          </div>
        ) : null
      )}

      {isEmpty && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No detachment abilities found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default FactionDetachments;
