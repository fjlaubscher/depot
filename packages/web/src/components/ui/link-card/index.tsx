import type { AnchorHTMLAttributes, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Card from '../card';

interface LinkCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'> {
  to: string;
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: ReactNode;
  showArrow?: boolean;
}

const LinkCard: FC<LinkCardProps> = ({
  to,
  children,
  className,
  description,
  icon,
  showArrow = false,
  ...rest
}) => {
  return (
    <Link
      to={to}
      className={classNames('group/link block h-full text-decoration-none', className)}
      data-testid="link-card"
      {...rest}
    >
      <Card interactive className="flex h-full flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Card.Title
              as="h2"
              className="truncate text-base text-foreground transition-colors duration-200 group-hover/link:text-accent"
            >
              {children}
            </Card.Title>
            {description ? (
              <Card.Description className="text-sm text-muted transition-colors duration-200 group-hover/link:text-body">
                {description}
              </Card.Description>
            ) : null}
          </div>

          {showArrow ? (
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full surface-soft text-muted transition-colors duration-200 group-hover/link:surface-accent group-hover/link:text-accent-strong">
              {/* callers can overlay their own arrow/icon if desired */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 17L17 7M10 7h7v7"
                />
              </svg>
            </span>
          ) : null}
          {icon ? (
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-colors duration-200 dark:bg-primary-500/15 dark:text-primary-200">
              {icon}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
};

export default LinkCard;
