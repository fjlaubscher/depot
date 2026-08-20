import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

interface DrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  /** `bottom` renders a sheet sliding up from the bottom edge. */
  position?: 'left' | 'right' | 'bottom';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  'data-testid'?: string;
}

const transitionDurationMs = 200;

const Drawer: FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  position = 'right',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  'data-testid': testId
}) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else if (isMounted) {
      setIsVisible(false);
      timeout = setTimeout(() => setIsMounted(false), transitionDurationMs);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [closeOnEscape, isOpen, onClose]);

  // Lock page scroll while the panel is on screen.
  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  const isBottom = position === 'bottom';

  const containerClasses = classNames('fixed inset-0 z-50 flex', {
    'justify-end': position === 'right',
    'justify-start': position === 'left',
    'items-end justify-center': isBottom
  });

  const overlayClasses = classNames(
    'absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out',
    isVisible ? 'opacity-100' : 'opacity-0',
    overlayClassName
  );

  const panelClasses = classNames(
    'relative z-10 transform transition-transform duration-200 ease-out pointer-events-auto',
    isBottom
      ? classNames(
          'flex w-full max-w-2xl max-h-[85vh] flex-col rounded-t-3xl surface-base shadow-xl',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )
      : classNames('h-full max-h-full w-full max-w-md', {
          'translate-x-0': isVisible,
          'translate-x-full': !isVisible && position === 'right',
          '-translate-x-full': !isVisible && position === 'left'
        }),
    className
  );

  return createPortal(
    <div className={containerClasses} data-testid={testId}>
      <div
        className={overlayClasses}
        role="presentation"
        onClick={() => {
          if (closeOnOverlayClick) {
            onClose?.();
          }
        }}
      />
      <div className={panelClasses}>
        {isBottom ? (
          <div className="flex justify-center pt-3" aria-hidden="true">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        ) : null}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
