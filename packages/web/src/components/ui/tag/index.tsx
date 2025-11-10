import type { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Tag: FC<TagProps> = ({ variant = 'default', size = 'md', className, children, ...props }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded transition-colors duration-200';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-700 dark:text-white',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    success: 'surface-success-strong text-success-strong',
    warning: 'surface-warning-strong text-warning-strong',
    danger: 'surface-danger-strong text-danger-strong'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={classNames(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

interface TagGroupProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

const TagGroup: FC<TagGroupProps> = ({ spacing = 'md', className, children, ...props }) => {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  return (
    <div
      className={classNames('flex flex-wrap items-center', spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface TagSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  spacing?: 'sm' | 'md' | 'lg';
  groupClassName?: string;
}

const TagSection: FC<TagSectionProps> = ({
  title,
  description,
  spacing = 'sm',
  className,
  groupClassName,
  children,
  ...props
}) => {
  return (
    <section className={classNames('flex flex-col gap-2', className)} {...props}>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {description ? <p className="text-xs text-subtle">{description}</p> : null}
      </div>

      <TagGroup spacing={spacing} className={groupClassName}>
        {children}
      </TagGroup>
    </section>
  );
};

export { Tag, TagGroup, TagSection };
export default Tag;
