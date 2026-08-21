import type { FC, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { cx } from '@/utils/cx';

interface DrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  /** `bottom` renders a sheet sliding up from the bottom edge. */
  position?: 'right' | 'bottom';
  'data-testid'?: string;
}

/** Native modal `<dialog>`: Escape, focus trap and backdrop come for free. Exit has no animation (ponytail). */
const Drawer: FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  className,
  position = 'right',
  'data-testid': testId
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  // Mounted only while open so children (forms) reset on reopen, as before.
  useEffect(() => {
    if (isOpen) ref.current?.showModal();
  }, [isOpen]);

  const isBottom = position === 'bottom';

  if (!isOpen) return null;

  return (
    <dialog
      ref={ref}
      data-testid={testId}
      onClose={() => onClose?.()}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className={cx(
        'fixed m-0 border-0 bg-transparent p-0 text-inherit transition-all transition-discrete duration-200 ease-out',
        'backdrop:bg-black/40 backdrop:opacity-0 open:backdrop:opacity-100 backdrop:transition-all backdrop:transition-discrete backdrop:duration-200 starting:open:backdrop:opacity-0',
        isBottom
          ? 'inset-x-0 bottom-0 top-auto mx-auto w-full max-w-2xl max-h-[85vh] translate-y-full open:translate-y-0 starting:open:translate-y-full'
          : 'inset-y-0 right-0 left-auto h-full max-h-none w-full max-w-md translate-x-full open:translate-x-0 starting:open:translate-x-full'
      )}
    >
      <div
        className={cx(
          isBottom
            ? 'flex w-full max-h-[85vh] flex-col rounded-t-3xl surface-base shadow-xl'
            : 'h-full max-h-full',
          className
        )}
      >
        {isBottom ? (
          <div className="flex justify-center pt-3" aria-hidden="true">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        ) : null}
        {children}
      </div>
    </dialog>
  );
};

export default Drawer;
