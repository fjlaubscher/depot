import type { FC } from 'react';

interface RosterEmptyStateProps {
  title: string;
  description: string;
  dataTestId?: string;
}

const RosterEmptyState: FC<RosterEmptyStateProps> = ({ title, description, dataTestId }) => (
  <div
    className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
    data-testid={dataTestId}
  >
    <div className="flex flex-col gap-2">
      <p className="text-gray-500 dark:text-gray-400 text-lg">{title}</p>
      <p className="text-gray-400 dark:text-gray-500 text-sm">{description}</p>
    </div>
  </div>
);

export default RosterEmptyState;
