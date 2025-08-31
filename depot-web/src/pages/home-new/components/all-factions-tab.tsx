import React from 'react';
import AllianceSection from './alliance-section';
import SearchFilters from './search-filters';
import NoResults from './no-results';
import { GroupedFactions } from '../utils/faction';

interface AllFactionsTabProps {
  groupedFactions: GroupedFactions;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  debouncedQuery: string;
}

const AllFactionsTab: React.FC<AllFactionsTabProps> = ({ 
  groupedFactions,
  query,
  onQueryChange,
  onClear,
  debouncedQuery
}) => {
  const hasResults = Object.keys(groupedFactions).length > 0;
  
  return (
    <div>
      <SearchFilters 
        query={query}
        onQueryChange={onQueryChange}
        onClear={onClear}
      />
      
      {hasResults ? (
        Object.keys(groupedFactions).map((allianceKey) => (
          <AllianceSection
            key={`alliance-${allianceKey}`}
            alliance={allianceKey}
            factions={groupedFactions[allianceKey]}
          />
        ))
      ) : debouncedQuery ? (
        <NoResults query={debouncedQuery} />
      ) : null}
    </div>
  );
};

export default AllFactionsTab;