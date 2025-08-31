import React from 'react';
import Filters from '@/components/ui/filters';
import Search from '@/components/ui/search';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  query, 
  onQueryChange, 
  onClear 
}) => {
  return (
    <Filters showClear={!!query} onClear={onClear}>
      <Search 
        label="Search by name" 
        value={query} 
        onChange={onQueryChange} 
      />
    </Filters>
  );
};

export default SearchFilters;