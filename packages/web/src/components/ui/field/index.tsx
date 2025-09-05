import React from 'react';
import classNames from 'classnames';

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  // Field is a container/wrapper component for form elements
}

const Field: React.FC<FieldProps> = ({ className, children, ...props }) => {
  return (
    <div className={classNames('flex flex-col gap-1', className)} {...props}>
      {children}
    </div>
  );
};

export default Field;
