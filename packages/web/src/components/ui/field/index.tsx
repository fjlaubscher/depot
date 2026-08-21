import type { FC, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  // Field is a container/wrapper component for form elements
}

const Field: FC<FieldProps> = ({ className, children, ...props }) => {
  return (
    <div className={cx('flex flex-col gap-1', className)} {...props}>
      {children}
    </div>
  );
};

export default Field;
