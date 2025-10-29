import type { ReactNode } from 'react';
import { Card } from '@/components/ui';

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  titleTestId?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  description,
  action,
  titleTestId,
  ...props
}) => {
  return (
    <Card {...props}>
      <div className="flex flex-col lg:justify-between lg:h-full lg:gap-4">
        <div className="flex items-center gap-4">
          {icon}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground" data-testid={titleTestId}>
              {title}
            </h3>
            <p className="text-sm text-muted">{description}</p>
          </div>
          {action && <div className="lg:hidden">{action}</div>}
        </div>
        {action && <div className="hidden lg:flex lg:justify-end">{action}</div>}
      </div>
    </Card>
  );
};

export default DashboardCard;
