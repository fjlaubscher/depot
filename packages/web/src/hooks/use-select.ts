import { useState, useMemo } from 'react';

/** `allLabel` is index 0 — name it after the filter so the select needs no label. */
const useSelect = (options: string[], allLabel = 'All') => {
  const [value, setValue] = useState(0);

  const transformed = useMemo(
    () => [allLabel, ...options].map((o, i) => ({ label: o, value: i })),
    [allLabel, options]
  );

  return {
    value,
    description: transformed[value]?.label || '',
    options: transformed,
    onChange: setValue
  };
};

export default useSelect;
