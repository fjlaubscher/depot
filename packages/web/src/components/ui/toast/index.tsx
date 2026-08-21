import type { FC } from 'react';
import { cx } from '@/utils/cx';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Toast as ToastType } from '@/contexts/toast/context';
import IconButton from '../icon-button';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

/**
 * A toast sits on the elevated surface like every other overlay — the status
 * colour rides on the glyph, not a full slab, so a stack of them stays quiet.
 * Only an error earns a coloured border.
 */
const TYPE_CONFIG = {
  success: { icon: <Check size={14} />, glyph: 'text-success-fg', border: 'border-border-strong' },
  error: {
    icon: <AlertCircle size={14} />,
    glyph: 'text-danger-fg',
    border: 'border-danger-border'
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    glyph: 'text-warning-fg',
    border: 'border-border-strong'
  },
  info: { icon: <Info size={14} />, glyph: 'text-info-fg', border: 'border-border-strong' }
} as const;

const Toast: FC<ToastProps> = ({ toast, onRemove }) => {
  const { id, title, message, type } = toast;
  const config = TYPE_CONFIG[type];

  return (
    <div
      className={cx(
        'pointer-events-auto flex w-full items-center gap-2.5 rounded-sm border bg-surface-elevated px-3 py-2.5 shadow-e2 sm:w-80',
        config.border
      )}
      role="status"
    >
      <span className={cx('flex-none', config.glyph)}>{config.icon}</span>

      <div className="min-w-0 flex-1">
        <p className="text-xs leading-snug font-bold text-foreground">{title}</p>
        {message ? <p className="text-[11.5px] leading-snug text-muted">{message}</p> : null}
      </div>

      <IconButton
        variant="ghost"
        size="sm"
        className="-mr-1.5 flex-none"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </IconButton>
    </div>
  );
};

export default Toast;
