import type { FC, ReactNode } from 'react';

interface StatsRowProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: 'default' | 'compact';
}

const StatsRow: FC<StatsRowProps> = ({ title, subtitle, children, variant = 'default' }) => {
  const containerGap = variant === 'compact' ? 'gap-1 sm:gap-2' : 'gap-2 sm:gap-4';
  const rowGap = variant === 'compact' ? 'gap-1 sm:gap-2' : 'gap-2 sm:gap-4';

  return (
    <div className={`flex flex-col ${containerGap}`}>
      <div className={`flex ${rowGap} items-center text-sm font-medium text-foreground`}>
        {title}
        {subtitle && <span className="text-xs text-subtle capitalize">[{subtitle}]</span>}
      </div>
      <div className={`flex flex-wrap sm:flex-nowrap ${rowGap}`}>{children}</div>
    </div>
  );
};

export default StatsRow;
