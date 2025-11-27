import type { AnchorHTMLAttributes, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import classNames from 'classnames';
import Card from '../card';

interface LinkCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'> {
  to: string;
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: ReactNode;
}

const LinkCard: FC<LinkCardProps> = ({ to, children, className, description, icon, ...rest }) => {
  return (
    <Link
      to={to}
      className={classNames('block text-decoration-none', className)}
      data-testid="link-card"
      {...rest}
    >
      <Card interactive className="h-full">
        <Card.Header className="items-start gap-3">
          {icon ? (
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <Card.Title as="h2" className="truncate text-base text-foreground">
              {children}
            </Card.Title>
            {description ? (
              <Card.Description className="text-sm text-muted">{description}</Card.Description>
            ) : null}
          </div>
          <ChevronRight className="text-hint flex-shrink-0" size={20} />
        </Card.Header>
      </Card>
    </Link>
  );
};

export default LinkCard;
