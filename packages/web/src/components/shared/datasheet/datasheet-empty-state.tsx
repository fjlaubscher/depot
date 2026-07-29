import type { FC } from 'react';

interface DatasheetEmptyStateProps {
  message: string;
}

export const DatasheetEmptyState: FC<DatasheetEmptyStateProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-subtle">
    <p>{message}</p>
  </div>
);

export default DatasheetEmptyState;
