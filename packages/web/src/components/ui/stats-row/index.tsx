import type { FC, ReactNode } from 'react';

interface StatsRowProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: 'default' | 'compact';
}

const StatsRow: FC<StatsRowProps> = ({ title, subtitle, children, variant = 'default' }) => {
  const gap = variant === 'compact' ? 'gap-1' : 'gap-2';

  return (
    <div className={`flex flex-col ${gap}`}>
      <div className={`flex ${gap} items-center text-sm font-medium text-gray-900 dark:text-white`}>
        {title}
        {subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">[{subtitle}]</span>
        )}
      </div>
      <div className={`flex ${gap}`}>{children}</div>
    </div>
  );
};

export default StatsRow;
