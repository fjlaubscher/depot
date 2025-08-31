import React, { useMemo, useState } from 'react';
import { depot } from 'depot-core';

// UI Components
import Grid from '@/components/ui/grid';
import SelectField from '@/components/ui/select-field';
import Search from '@/components/ui/search';
import Filters from '@/components/ui/filters';
import EnhancementCard from './enhancement-card';

// Hooks
import useDebounce from '@/hooks/use-debounce';
import useSelect from '@/hooks/use-select';

// Utils
import {
  groupEnhancementsByDetachment,
  filterEnhancements,
  getUniqueEnhancementDetachmentTypes,
  isEnhancementGroupedDataEmpty
} from '@/utils/enhancement';

interface FactionEnhancementsProps {
  enhancements: depot.Enhancement[];
}

const FactionEnhancements: React.FC<FactionEnhancementsProps> = ({ enhancements }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const detachmentTypes = useMemo(() => {
    const types = getUniqueEnhancementDetachmentTypes(enhancements);
    return types;
  }, [enhancements]);

  const { description: detachment, value, onChange, options } = useSelect(detachmentTypes);

  const groupedEnhancements = useMemo(() => {
    // Only pass detachment if it's not "All" (value !== 0)
    const detachmentFilter = value !== 0 ? detachment : undefined;
    const filteredEnhancements = filterEnhancements(enhancements, debouncedQuery, detachmentFilter);
    const grouped = groupEnhancementsByDetachment(filteredEnhancements);
    return grouped;
  }, [enhancements, debouncedQuery, detachment, value]);

  const isEmpty = useMemo(
    () => isEnhancementGroupedDataEmpty(groupedEnhancements),
    [groupedEnhancements]
  );

  return (
    <div className="space-y-6" data-testid="faction-enhancements">
      <Filters
        showClear={value !== 0 || !!query}
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

      {Object.keys(groupedEnhancements).map((key) =>
        groupedEnhancements[key].length > 0 ? (
          <div key={key} className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">
                {key}
              </h2>
            </div>
            <Grid>
              {groupedEnhancements[key].map((enhancement) => (
                <EnhancementCard key={enhancement.id} enhancement={enhancement} />
              ))}
            </Grid>
          </div>
        ) : null
      )}

      {isEmpty && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No enhancements found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default FactionEnhancements;
