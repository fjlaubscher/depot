import type { FC } from 'react';
import Field from '../field';

interface SearchProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
  className?: string;
  testId?: string;
}

const Search: FC<SearchProps> = ({
  label,
  value,
  placeholder = 'Search',
  onChange,
  className,
  testId
}) => (
  <Field className={className}>
    {label && (
      <label htmlFor="search" className="sr-only">
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
      data-testid={testId}
      className="input-base focus-ring-primary"
    />
  </Field>
);

export default Search;
