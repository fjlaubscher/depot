import React from 'react';
import classNames from 'classnames';

interface Option {
  label: string;
  value: string | number;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  fullWidth = true,
  className,
  id,
  name,
  ...props
}) => {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
  
  const selectClasses = classNames(
    'border border-gray-300 rounded-md px-3 py-2 text-base transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-gray-50 disabled:text-gray-500',
    'bg-white',
    error ? 'border-red-500' : '',
    fullWidth ? 'w-full' : '',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        className={selectClasses}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SelectField;