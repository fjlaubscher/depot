import type { FC } from 'react';
import { X } from 'lucide-react';
import Field from '../field';
import { cx } from '@/utils/cx';

interface SearchProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
  className?: string;
  testId?: string;
  /** Trailing X inside the field when there is query text. */
  clearable?: boolean;
  clearTestId?: string;
}

const Search: FC<SearchProps> = ({
  label,
  value,
  placeholder = 'Search',
  onChange,
  className,
  testId,
  clearable,
  clearTestId
}) => {
  const showClear = Boolean(clearable && value.trim());

  return (
    <Field className={className}>
      {label && (
        <label htmlFor="search" className="sr-only">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id="search"
          name="search"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          data-testid={testId}
          className={cx('input-base focus-ring-primary', showClear && 'pr-9')}
        />
        {showClear ? (
          <button
            type="button"
            aria-label="Clear search"
            data-testid={clearTestId}
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted hover:text-foreground focus-ring-primary"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </Field>
  );
};

export default Search;
