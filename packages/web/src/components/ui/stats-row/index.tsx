import type { FC, ReactNode } from 'react';

interface StatsRowProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const StatsRow: FC<StatsRowProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center text-sm font-medium text-gray-900 dark:text-white">
        {title}
        {subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">[{subtitle}]</span>
        )}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
};

export default StatsRow;
