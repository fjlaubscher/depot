import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import classNames from 'classnames';
import Card from '../card';

const badgeVariantMap = {
  primary: 'accent',
  secondary: 'muted',
  success: 'success',
  warning: 'warning',
  danger: 'danger'
} as const;

export interface Badge {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

interface ContentCardProps {
  title: string;
  subtitle?: string;
  legend?: string;
  badges?: Badge[];
  actions?: ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  children?: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  'data-testid'?: string;
}

export const ContentCard: FC<ContentCardProps> = ({
  title,
  subtitle,
  legend,
  badges,
  actions,
  expandable = false,
  defaultExpanded = false,
  children,
  className,
  padding = 'md',
  onClick,
  'data-testid': dataTestId
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggleExpand = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card
      className={classNames('h-full', className)}
      padding={padding}
      interactive={Boolean(onClick)}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <div className="flex flex-col gap-3">
        <Card.Header className="gap-4">
          <div className="min-w-0 flex-1">
            <Card.Title className="truncate">{title}</Card.Title>
            {subtitle ? <Card.Subtitle>{subtitle}</Card.Subtitle> : null}
          </div>

          {(badges?.length ?? 0) > 0 || actions ? (
            <div className="flex items-start gap-3">
              {(badges?.length ?? 0) > 0 ? (
                <Card.BadgeGroup direction="column">
                  {badges?.map((badge, index) => (
                    <Card.Badge
                      key={index}
                      variant={badgeVariantMap[badge.variant ?? 'primary']}
                      size={badge.size ?? 'sm'}
                    >
                      {badge.text}
                    </Card.Badge>
                  ))}
                </Card.BadgeGroup>
              ) : null}
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
          ) : null}
        </Card.Header>

        {legend ? <Card.Legend>{legend}</Card.Legend> : null}

        {expandable ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleToggleExpand();
              }}
              className="flex items-center gap-2 self-start rounded-md px-2 py-1 text-sm font-medium text-accent transition-colors hover:text-accent-strong focus-ring-primary"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show Details
                </>
              )}
            </button>
            {isExpanded && children ? <Card.Content separated>{children}</Card.Content> : null}
          </>
        ) : children ? (
          <Card.Content>{children}</Card.Content>
        ) : null}
      </div>
    </Card>
  );
};

export default ContentCard;
