import React, { useMemo, useState } from 'react';
import { depot } from '@depot/core';

// UI Components
import Search from '@/components/ui/search';
import Filters from '@/components/ui/filters';
import DetachmentSection from './detachment-section';

// Hooks
import useDebounce from '@/hooks/use-debounce';

// Utils
import { groupFactionDataByDetachment } from '@/utils/faction';

interface FactionDetachmentsProps {
  detachmentAbilities: depot.DetachmentAbility[];
  enhancements: depot.Enhancement[];
  stratagems: depot.Stratagem[];
}

const FactionDetachments: React.FC<FactionDetachmentsProps> = ({
  detachmentAbilities,
  enhancements,
  stratagems
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  // Get all unique detachments from all data sources
  const detachmentsByName = useMemo(() => {
    return groupFactionDataByDetachment(detachmentAbilities, enhancements, stratagems);
  }, [detachmentAbilities, enhancements, stratagems]);

  // Filter detachments by name query
  const filteredDetachments = useMemo(() => {
    if (!debouncedQuery) {
      return detachmentsByName;
    }

    const filtered: typeof detachmentsByName = {};
    Object.keys(detachmentsByName).forEach((detachmentName) => {
      if (detachmentName.toLowerCase().includes(debouncedQuery.toLowerCase())) {
        filtered[detachmentName] = detachmentsByName[detachmentName];
      }
    });

    return filtered;
  }, [detachmentsByName, debouncedQuery]);

  const clearFilters = () => {
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-4" data-testid="faction-detachments">
      <Filters showClear={!!query} onClear={clearFilters}>
        <Search label="Search detachments by name" value={query} onChange={setQuery} />
      </Filters>

      <div className="flex flex-col gap-4">
        {Object.keys(filteredDetachments)
          .sort()
          .map((detachmentName) => (
            <DetachmentSection
              key={detachmentName}
              detachmentName={detachmentName}
              abilities={filteredDetachments[detachmentName].abilities}
              enhancements={filteredDetachments[detachmentName].enhancements}
              stratagems={filteredDetachments[detachmentName].stratagems}
            />
          ))}
      </div>

      {Object.keys(filteredDetachments).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No detachments found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default FactionDetachments;
