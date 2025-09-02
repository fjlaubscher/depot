import React from 'react';
import classNames from 'classnames';

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  // Field is a container/wrapper component for form elements
}

const Field: React.FC<FieldProps> = ({ className, children, ...props }) => {
  return (
    <div className={classNames('space-y-1', className)} {...props}>
      {children}
    </div>
  );
};

export default Field;
