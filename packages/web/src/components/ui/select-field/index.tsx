import type { FC, SelectHTMLAttributes } from 'react';
import classNames from 'classnames';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
  'data-testid'?: string;
  selectDataTestId?: string;
}

const SelectField: FC<SelectFieldProps> = ({
  label,
  options,
  error,
  fullWidth = true,
  className,
  id,
  name,
  placeholder,
  'data-testid': dataTestId,
  selectDataTestId,
  ...props
}) => {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const selectClasses = classNames(
    'appearance-none cursor-pointer',
    'border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 text-sm',
    'bg-white dark:bg-gray-800 text-foreground',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 disabled:cursor-not-allowed',
    'transition-colors duration-200',
    error ? 'border-red-500 dark:border-red-400' : '',
    fullWidth ? 'w-full' : '',
    className
  );

  return (
    <div
      className={classNames('flex flex-col gap-1', fullWidth ? 'w-full' : '')}
      data-testid={dataTestId}
    >
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-body">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          className={selectClasses}
          data-testid={selectDataTestId ?? (dataTestId ? `${dataTestId}-select` : undefined)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hint pointer-events-none"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};

export default SelectField;
