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
      <div className="flex flex-col gap-4 lg:h-full">
        <Card.Header className="items-center gap-4">
          <div className="flex flex-1 items-center gap-4">
            {icon}
            <div className="min-w-0 flex-1">
              <Card.Title as="h3" className="text-base" data-testid={titleTestId}>
                {title}
              </Card.Title>
              <Card.Description>{description}</Card.Description>
            </div>
          </div>
          {action ? <div className="lg:hidden">{action}</div> : null}
        </Card.Header>
        {action ? (
          <Card.Footer align="end" separated={false} className="hidden lg:flex">
            {action}
          </Card.Footer>
        ) : null}
      </div>
    </Card>
  );
};

export default DashboardCard;
