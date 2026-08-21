import React, { useState } from 'react';

import { Field, SelectField } from '@/components/ui';

interface MaxPointsFieldProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  'data-testid'?: string;
}

const PRESET_POINTS: Record<string, number> = { incursion: 1000, 'strike-force': 2000 };

const MaxPointsField: React.FC<MaxPointsFieldProps> = ({
  value,
  onChange,
  error,
  'data-testid': dataTestId
}) => {
  // Explicitly chosen "Custom" sticks even when the typed value matches a preset.
  const [isCustom, setIsCustom] = useState(false);
  const preset = Object.keys(PRESET_POINTS).find((key) => PRESET_POINTS[key] === value);
  const selectedOption = isCustom || !preset ? 'custom' : preset;

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
        onChange={(event) => {
          const option = event.target.value;
          setIsCustom(option === 'custom');
          if (option !== 'custom') onChange(PRESET_POINTS[option]);
        }}
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
            className="input-base"
            value={value || ''}
            onChange={(event) => onChange(parseInt(event.target.value, 10) || 0)}
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
