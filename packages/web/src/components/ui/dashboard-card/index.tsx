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
      <div className="flex flex-col xl:justify-between xl:h-full xl:gap-4">
        <div className="flex items-center gap-4">
          {icon}
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 dark:text-white"
              data-testid={titleTestId}
            >
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
          {action && <div className="xl:hidden">{action}</div>}
        </div>
        {action && <div className="hidden xl:flex xl:justify-end">{action}</div>}
      </div>
    </Card>
  );
};

export default DashboardCard;
