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
      <label htmlFor="search" className="block text-sm font-medium text-body">
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
      className="input-base max-w-2xl focus-ring-primary"
    />
  </Field>
);

export default Search;
