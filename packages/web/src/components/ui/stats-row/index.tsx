import type { FC, ReactNode } from 'react';

interface StatsRowProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const StatsRow: FC<StatsRowProps> = ({ title, subtitle, children }) => (
  <div className="flex flex-col gap-2">
    <div className="flex gap-2 items-center text-sm font-bold text-foreground">
      {title}
      {subtitle && <span className="text-xs text-subtle capitalize">[{subtitle}]</span>}
    </div>
    <div className="grid grid-cols-6 gap-0.5">{children}</div>
  </div>
);

export default StatsRow;
