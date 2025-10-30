import type { ElementType, HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
  padding?: CardPadding;
  interactive?: boolean;
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'shadow-sm',
  outlined: 'shadow-none'
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, interactive, onClick, ...props }, ref) => {
    const isInteractive = interactive ?? typeof onClick === 'function';

    return (
      <div
        ref={ref}
        className={classNames(
          'surface-card transition-shadow duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          isInteractive &&
            'cursor-pointer hover:border-accent hover:shadow-md focus-visible:border-accent focus-visible:shadow-md focus-visible:outline-offset-2 focus-ring-primary',
          className
        )}
        onClick={onClick}
        {...props}
      />
    );
  }
);

CardRoot.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames('flex w-full flex-wrap items-start justify-between gap-3', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'Card.Header';

interface CardTitleProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

const CardTitle = ({ as: Component = 'h3', className, ...props }: CardTitleProps) => (
  <Component
    className={classNames('text-sm font-semibold leading-tight text-foreground', className)}
    {...props}
  />
);

CardTitle.displayName = 'Card.Title';

interface CardSubtitleProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

const CardSubtitle = ({ as: Component = 'p', className, ...props }: CardSubtitleProps) => (
  <Component className={classNames('text-sm text-secondary', className)} {...props} />
);

CardSubtitle.displayName = 'Card.Subtitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

const CardDescription = ({ as: Component = 'p', className, ...props }: CardDescriptionProps) => (
  <Component className={classNames('text-sm text-muted', className)} {...props} />
);

CardDescription.displayName = 'Card.Description';

const CardLegend = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={classNames('text-sm italic text-muted', className)} {...props} />
  )
);

CardLegend.displayName = 'Card.Legend';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  separated?: boolean;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ separated = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        'text-sm leading-relaxed text-body',
        separated && 'border-t border-subtle pt-3',
        className
      )}
      {...props}
    />
  )
);

CardContent.displayName = 'Card.Content';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  separated?: boolean;
}

const alignmentMap: Record<NonNullable<CardFooterProps['align']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end'
};

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'start', separated = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        'flex w-full items-center gap-3',
        separated && 'border-t border-subtle pt-4',
        alignmentMap[align],
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'Card.Footer';

export type CardBadgeVariant = 'accent' | 'muted' | 'info' | 'success' | 'warning' | 'danger';

export type CardBadgeSize = 'sm' | 'md';

interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: CardBadgeVariant;
  size?: CardBadgeSize;
}

const badgeVariantClasses: Record<CardBadgeVariant, string> = {
  accent: 'surface-accent text-accent-strong border-accent',
  muted: 'surface-soft text-secondary border-subtle',
  info: 'surface-info-strong text-info-strong border-info',
  success: 'surface-success-strong text-success-strong border-success',
  warning: 'surface-warning-strong text-warning-strong border-warning',
  danger: 'surface-danger-strong text-danger-strong border-danger'
};

const badgeSizeClasses: Record<CardBadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm'
};

const CardBadge = forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ variant = 'accent', size = 'sm', className, ...props }, ref) => (
    <span
      ref={ref}
      className={classNames(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        badgeVariantClasses[variant],
        badgeSizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

CardBadge.displayName = 'Card.Badge';

interface CardBadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
}

const CardBadgeGroup = forwardRef<HTMLDivElement, CardBadgeGroupProps>(
  ({ direction = 'row', className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        'flex gap-1',
        direction === 'column' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
      {...props}
    />
  )
);

CardBadgeGroup.displayName = 'Card.BadgeGroup';

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Description: CardDescription,
  Legend: CardLegend,
  Content: CardContent,
  Footer: CardFooter,
  Badge: CardBadge,
  BadgeGroup: CardBadgeGroup
});

export default Card;
