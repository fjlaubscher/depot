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
}

const LinkCard: FC<LinkCardProps> = ({ to, children, className, ...rest }) => {
  return (
    <Link
      to={to}
      className={classNames('block text-decoration-none', className)}
      data-testid="link-card"
      {...rest}
    >
      <Card interactive className="h-full">
        <Card.Header className="items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{children}</span>
          <ChevronRight className="text-hint flex-shrink-0" size={20} />
        </Card.Header>
      </Card>
    </Link>
  );
};

export default LinkCard;
