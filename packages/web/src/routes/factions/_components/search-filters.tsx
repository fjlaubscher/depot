import React from 'react';
import Filters from '@/components/ui/filters';
import Search from '@/components/ui/search';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ query, onQueryChange, onClear }) => {
  return (
    <Filters showClear={!!query} onClear={onClear} clearTestId="faction-search-clear">
      <Search
        label="Search by name"
        value={query}
        onChange={onQueryChange}
        testId="faction-search"
        className="w-full sm:max-w-3xl"
      />
    </Filters>
  );
};

export default SearchFilters;
