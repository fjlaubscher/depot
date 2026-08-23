import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
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

/**
 * Native modal `<dialog>`: Escape, focus trap and backdrop come for free.
 * The dialog stays mounted so `close()` can play the exit transition;
 * `display`/`overlay` are transitioned discretely to keep it in the top layer
 * until the slide finishes.
 */
const Drawer: FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  className,
  position = 'right',
  'data-testid': testId
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  // Bumped on each open so children (forms) remount and reset, as they did when
  // the drawer unmounted. 0 means never opened, so nothing renders up front.
  const [openCount, setOpenCount] = useState(0);
  const wasOpen = useRef(false);

  if (isOpen !== wasOpen.current) {
    wasOpen.current = isOpen;
    if (isOpen) setOpenCount((count) => count + 1);
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const isBottom = position === 'bottom';

  return (
    <dialog
      ref={ref}
      data-testid={testId}
      onClose={() => onClose?.()}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className={cx(
        'fixed m-0 border-0 bg-transparent p-0 text-inherit transition-[all,overlay] transition-discrete duration-200 ease-out',
        'backdrop:bg-surface-overlay backdrop:opacity-0 open:backdrop:opacity-100 backdrop:transition-[all,overlay] backdrop:transition-discrete backdrop:duration-200 starting:open:backdrop:opacity-0',
        isBottom
          ? 'inset-x-0 bottom-0 top-auto mx-auto w-full max-w-2xl max-h-[85vh] translate-y-full open:translate-y-0 starting:open:translate-y-full'
          : 'inset-y-0 right-0 left-auto h-full max-h-none w-full max-w-md translate-x-full open:translate-x-0 starting:open:translate-x-full'
      )}
    >
      {openCount > 0 ? (
        <div
          key={openCount}
          className={cx(
            isBottom
              ? 'flex w-full max-h-[85vh] flex-col rounded-t-lg bg-surface-elevated shadow-e3'
              : 'h-full max-h-full',
            className
          )}
        >
          {isBottom ? (
            <div className="flex justify-center pt-3" aria-hidden="true">
              <div className="h-1.5 w-12 rounded-full bg-border-strong" />
            </div>
          ) : null}
          {children}
        </div>
      ) : null}
    </dialog>
  );
};

export default Drawer;
