import React from 'react';
import classNames from 'classnames';

interface PointsTagProps {
  points: string | number;
  maxPoints?: string | number;
  className?: string;
}

const PointsTag: React.FC<PointsTagProps> = ({ points, maxPoints, className }) => {
  return (
    <span
      className={classNames(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        className
      )}
    >
      {maxPoints ? `${points} / ${maxPoints} pts` : `${points} pts`}
    </span>
  );
};

export default PointsTag;
