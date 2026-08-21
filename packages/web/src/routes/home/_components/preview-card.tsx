import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Card, Tag } from '@/components/ui';

interface PreviewCardProps {
  to: string;
  title: string;
  subtitle: ReactNode;
  badge: ReactNode;
  testId: string;
}

const PreviewCard: FC<PreviewCardProps> = ({ to, title, subtitle, badge, testId }) => (
  <Link to={to} className="group/link block h-full text-decoration-none" data-testid={testId}>
    <Card interactive className="h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Card.Title
            as="h3"
            className="truncate text-base transition-colors duration-200 group-hover/link:text-accent"
          >
            {title}
          </Card.Title>
          <Card.Subtitle as="span" className="truncate text-xs">
            {subtitle}
          </Card.Subtitle>
        </div>
        <Tag variant="primary" size="sm" className="shrink-0 whitespace-nowrap">
          {badge}
        </Tag>
      </div>
    </Card>
  </Link>
);

export default PreviewCard;
