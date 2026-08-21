import type { ElementType, HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';

export type CardPadding = 'none' | 'sm' | 'md';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  interactive?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4'
};

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', className, interactive, onClick, ...props }, ref) => {
    const isInteractive = interactive ?? typeof onClick === 'function';

    return (
      <div
        ref={ref}
        className={classNames(
          'surface-card shadow-sm transition-shadow duration-200',
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
      className={classNames(
        'flex w-full flex-wrap items-start justify-between gap-2 border-b border-subtle pb-2',
        className
      )}
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

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={classNames('text-sm leading-relaxed text-body', className)}
    {...props}
  />
));

CardContent.displayName = 'Card.Content';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        'flex w-full items-center justify-start gap-2 border-t border-subtle pt-2',
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'Card.Footer';

export type CardBadgeVariant = 'accent' | 'muted' | 'info' | 'success' | 'warning' | 'danger';

interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: CardBadgeVariant;
}

const badgeVariantClasses: Record<CardBadgeVariant, string> = {
  accent: 'surface-accent text-accent-strong border-accent',
  muted: 'surface-soft text-secondary border-subtle',
  info: 'surface-info-strong text-info-strong border-info',
  success: 'surface-success-strong text-success-strong border-success',
  warning: 'surface-warning-strong text-warning-strong border-warning',
  danger: 'surface-danger-strong text-danger-strong border-danger'
};

const CardBadge = forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ variant = 'accent', className, ...props }, ref) => (
    <span
      ref={ref}
      className={classNames(
        'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium',
        badgeVariantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

CardBadge.displayName = 'Card.Badge';

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Description: CardDescription,
  Legend: CardLegend,
  Content: CardContent,
  Footer: CardFooter,
  Badge: CardBadge
});

export default Card;
