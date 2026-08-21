import type { AnchorHTMLAttributes, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cx } from '@/utils/cx';
import Card from '../card';

interface LinkCardProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'children' | 'className'
> {
  to: string;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
}

const LinkCard: FC<LinkCardProps> = ({ to, children, className, showArrow = false, ...rest }) => {
  return (
    <Link
      to={to}
      className={cx('group/link block h-full text-decoration-none', className)}
      data-testid="link-card"
      {...rest}
    >
      <Card interactive className="flex h-full flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Card.Title
              as="h2"
              className="truncate text-base text-foreground transition-colors duration-200 group-hover/link:text-accent"
            >
              {children}
            </Card.Title>
          </div>

          {showArrow ? (
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-soft text-muted transition-colors duration-200 group-hover/link:bg-surface-accent group-hover/link:text-accent">
              <ArrowUpRight size={16} />
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
};

export default LinkCard;
