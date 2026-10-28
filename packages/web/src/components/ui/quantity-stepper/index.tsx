import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import IconButton from '../icon-button';

interface QuantityStepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  size?: 'sm' | 'md';
  decreaseLabel?: string;
  increaseLabel?: string;
}

const QuantityStepper: FC<QuantityStepperProps> = ({
  value,
  onDecrease,
  onIncrease,
  min = 0,
  size = 'md',
  decreaseLabel,
  increaseLabel
}) => {
  const { t } = useTranslation('common');
  const disableDecrease = value <= min;

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div className="inline-flex items-center gap-1">
      <IconButton
        size={size}
        variant="ghost"
        aria-label={decreaseLabel ?? t('actions.decreaseQuantity')}
        onClick={onDecrease}
        disabled={disableDecrease}
      >
        <Minus size={iconSize} />
      </IconButton>
      <span className="min-w-[2rem] text-center type-stat text-base">{value}</span>
      <IconButton
        size={size}
        variant="ghost"
        aria-label={increaseLabel ?? t('actions.increaseQuantity')}
        onClick={onIncrease}
      >
        <Plus size={iconSize} />
      </IconButton>
    </div>
  );
};

export default QuantityStepper;
