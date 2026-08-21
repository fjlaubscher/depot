import type { FC, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

/** Shared so anything tinted by the same status (pills, chips) matches the tag. */
export const TAG_VARIANT_CLASSES: Record<NonNullable<TagProps['variant']>, string> = {
  default: 'bg-surface-soft text-body border-border-strong',
  primary: 'bg-surface-accent text-accent border-border-accent',
  secondary: 'bg-info-surface text-info-fg border-info-border',
  success: 'bg-success-surface text-success-fg border-success-border',
  warning: 'bg-warning-surface text-warning-fg border-warning-border',
  danger: 'bg-danger-surface text-danger-fg border-danger-border'
};

const Tag: FC<TagProps> = ({ variant = 'default', size = 'md', className, children, ...props }) => {
  const baseClasses =
    'inline-flex items-center font-medium rounded-xs border transition-colors duration-200';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };

  return (
    <span
      className={cx(baseClasses, TAG_VARIANT_CLASSES[variant], sizeClasses[size], className)}
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
      className={cx('flex flex-wrap items-center', spacingClasses[spacing], className)}
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
}

const TagSection: FC<TagSectionProps> = ({
  title,
  description,
  spacing = 'sm',
  className,
  children,
  ...props
}) => {
  return (
    <section className={cx('flex flex-col gap-2', className)} {...props}>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {description ? <p className="text-xs text-subtle">{description}</p> : null}
      </div>

      <TagGroup spacing={spacing}>{children}</TagGroup>
    </section>
  );
};

export { Tag, TagGroup, TagSection };
export default Tag;
