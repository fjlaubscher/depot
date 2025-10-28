import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import classNames from 'classnames';

interface DrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  position?: 'left' | 'right';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
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
  closeOnEscape = true
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
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [closeOnEscape, isOpen, onClose]);

  if (!isMounted) {
    return null;
  }

  const containerClasses = classNames('fixed inset-0 z-50 flex', {
    'justify-end': position === 'right',
    'justify-start': position === 'left'
  });

  const overlayClasses = classNames(
    'absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out',
    isVisible ? 'opacity-100' : 'opacity-0',
    overlayClassName
  );

  const panelClasses = classNames(
    'relative z-10 h-full max-h-full w-full max-w-md transform transition-transform duration-200 ease-out pointer-events-auto',
    position === 'right'
      ? isVisible
        ? 'translate-x-0'
        : 'translate-x-full'
      : isVisible
        ? 'translate-x-0'
        : '-translate-x-full',
    className
  );

  return (
    <div className={containerClasses}>
      <div
        className={overlayClasses}
        role="presentation"
        onClick={() => {
          if (closeOnOverlayClick) {
            onClose?.();
          }
        }}
      />
      <div className={panelClasses}>{children}</div>
    </div>
  );
};

export default Drawer;
