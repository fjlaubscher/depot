import type { FC, ReactNode } from 'react';

interface StatsRowProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: 'default' | 'compact';
}

const StatsRow: FC<StatsRowProps> = ({ title, subtitle, children, variant = 'default' }) => {
  const containerGap = 'gap-2';
  const rowGap = 'gap-2';

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
