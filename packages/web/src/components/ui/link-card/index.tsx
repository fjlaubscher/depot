import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import classNames from 'classnames';
import Card from '../card';

interface LinkCardProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const LinkCard: FC<LinkCardProps> = ({ to, children, className }) => {
  return (
    <Link
      to={to}
      className={classNames('block text-decoration-none', className)}
      data-testid="link-card"
    >
      <Card
        hover={true}
        className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all duration-200 h-full"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-gray-900 dark:text-gray-100 font-medium">{children}</div>
          <ChevronRight className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={20} />
        </div>
      </Card>
    </Link>
  );
};

export default LinkCard;
