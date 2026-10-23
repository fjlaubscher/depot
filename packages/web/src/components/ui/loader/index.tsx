import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '@/utils/cx';

interface LoaderProps {
  size?: 'sm' | 'md';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const Loader: FC<LoaderProps> = ({ size = 'md', color = 'primary', className }) => {
  const { t } = useTranslation('common', { useSuspense: false });
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2'
  };

  const colorClasses = {
    primary: 'border-border-subtle border-t-accent',
    secondary: 'border-border-subtle border-t-accent',
    white: 'border-accent-ink border-t-transparent'
  };

  return (
    <div
      data-testid="loader"
      role="status"
      aria-label={t('loading', { defaultValue: 'Loading…' })}
      className={cx('rounded-full animate-spin', sizeClasses[size], colorClasses[color], className)}
    />
  );
};

export default Loader;
