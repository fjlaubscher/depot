import { useState, useMemo } from 'react';

const useSelect = (options: string[]) => {
  const [value, setValue] = useState(0);

  const transformed = useMemo(
    () => ['All', ...options].map((o, i) => ({ description: o, value: i })),
    [options]
  );

  return {
    value,
    description: value ? transformed[value].description : '',
    options: transformed,
    onChange: setValue
  };
};

export default useSelect;
