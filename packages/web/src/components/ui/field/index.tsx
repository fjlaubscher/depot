import type { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  // Field is a container/wrapper component for form elements
}

const Field: FC<FieldProps> = ({ className, children, ...props }) => {
  return (
    <div className={classNames('flex flex-col gap-1', className)} {...props}>
      {children}
    </div>
  );
};

export default Field;
