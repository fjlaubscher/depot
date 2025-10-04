import type { FC } from 'react';
import classNames from 'classnames';
import { Minus, Plus } from 'lucide-react';
import IconButton from '../icon-button';

interface QuantityStepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
  decreaseLabel?: string;
  increaseLabel?: string;
}

const QuantityStepper: FC<QuantityStepperProps> = ({
  value,
  onDecrease,
  onIncrease,
  min = 0,
  max,
  className,
  size = 'md',
  decreaseLabel = 'Decrease quantity',
  increaseLabel = 'Increase quantity'
}) => {
  const disableDecrease = value <= min;
  const disableIncrease = typeof max === 'number' ? value >= max : false;

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div className={classNames('inline-flex items-center gap-1', className)}>
      <IconButton
        size={size}
        variant="ghost"
        aria-label={decreaseLabel}
        onClick={onDecrease}
        disabled={disableDecrease}
      >
        <Minus size={iconSize} />
      </IconButton>
      <span className="min-w-[2rem] text-center text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
      <IconButton
        size={size}
        variant="ghost"
        aria-label={increaseLabel}
        onClick={onIncrease}
        disabled={disableIncrease}
      >
        <Plus size={iconSize} />
      </IconButton>
    </div>
  );
};

export default QuantityStepper;
