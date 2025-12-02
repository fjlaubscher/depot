import React, { useEffect, useState } from 'react';

import { Field, SelectField } from '@/components/ui';

type MaxPointsOption = 'incursion' | 'strike-force' | 'custom';

interface MaxPointsFieldProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  'data-testid'?: string;
}

const PRESET_POINTS: Record<Exclude<MaxPointsOption, 'custom'>, number> = {
  incursion: 1000,
  'strike-force': 2000
};

const getOptionFromValue = (points: number): MaxPointsOption => {
  if (points === PRESET_POINTS.incursion) {
    return 'incursion';
  }
  if (points === PRESET_POINTS['strike-force']) {
    return 'strike-force';
  }
  return 'custom';
};

const MaxPointsField: React.FC<MaxPointsFieldProps> = ({
  value,
  onChange,
  error,
  'data-testid': dataTestId
}) => {
  const [selectedOption, setSelectedOption] = useState<MaxPointsOption>(() =>
    getOptionFromValue(value)
  );
  const [customValue, setCustomValue] = useState(() =>
    getOptionFromValue(value) === 'custom' ? value.toString() : ''
  );

  useEffect(() => {
    const optionFromValue = getOptionFromValue(value);
    setSelectedOption(optionFromValue);
    if (optionFromValue === 'custom') {
      setCustomValue(value.toString());
    }
  }, [value]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const option = event.target.value as MaxPointsOption;
    setSelectedOption(option);

    if (option === 'custom') {
      setCustomValue((prev) => (prev ? prev : value.toString()));
      return;
    }

    onChange(PRESET_POINTS[option]);
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setCustomValue(next);

    const parsed = parseInt(next, 10);
    onChange(Number.isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className="flex flex-col gap-4" data-testid={dataTestId}>
      <SelectField
        label="Max Points"
        options={[
          { value: 'incursion', label: 'Incursion (1000 pts)' },
          { value: 'strike-force', label: 'Strike Force (2000 pts)' },
          { value: 'custom', label: 'Custom' }
        ]}
        selectDataTestId="max-points-field-select"
        value={selectedOption}
        onChange={handleSelectChange}
        required
      />

      {selectedOption === 'custom' && (
        <Field
          data-testid={dataTestId ? `${dataTestId}-custom-field` : undefined}
          className="gap-1"
        >
          <label htmlFor="custom-max-points" className="block text-sm font-medium text-body">
            Custom Max Points
          </label>
          <input
            data-testid="max-points-input"
            id="custom-max-points"
            type="number"
            min={1}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-foreground"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="Enter points limit"
            required
          />
        </Field>
      )}
      {error && selectedOption === 'custom' ? (
        <p className="text-sm text-danger" data-testid="max-points-error">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default MaxPointsField;
