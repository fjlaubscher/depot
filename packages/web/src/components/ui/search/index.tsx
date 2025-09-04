import React from 'react';
import Field from '../field';

interface SearchProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
  className?: string;
}

const Search: React.FC<SearchProps> = ({
  label,
  value,
  placeholder = 'Search',
  onChange,
  className
}) => (
  <Field className={className}>
    {label && (
      <label
        htmlFor="search"
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label}
      </label>
    )}
    <input
      id="search"
      name="search"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
    />
  </Field>
);

export default Search;
