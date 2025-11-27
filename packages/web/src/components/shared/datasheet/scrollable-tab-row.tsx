import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import type { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableTabRowProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  label?: string;
  description?: string;
  testId?: string;
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

interface ScrollState {
  atStart: boolean;
  atEnd: boolean;
}

const ScrollableTabRow: FC<ScrollableTabRowProps> = ({
  children,
  className,
  innerClassName,
  label,
  description,
  testId,
  containerProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({ atStart: true, atEnd: true });
  const scrollTargetLabel = label ? label.toLowerCase() : 'items';

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = node;
      const atStart = scrollLeft <= 1;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      setScrollState((prev) =>
        prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd }
      );
    };

    const handleScroll = () => updateScrollState();

    updateScrollState();
    node.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateScrollState())
        : undefined;

    if (resizeObserver) {
      resizeObserver.observe(node);
    }

    return () => {
      node.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, []);

  const { className: containerClassName, ...restContainerProps } = containerProps ?? {};

  const scrollByOffset = (offset: number) => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div
      {...restContainerProps}
      data-testid={testId}
      className={classNames('flex flex-col gap-2', className, containerClassName)}
    >
      {label ? <span className="text-sm font-medium text-secondary">{label}</span> : null}

      <div className="relative">
        <div
          ref={containerRef}
          className={classNames(
            'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            innerClassName
          )}
        >
          {children}
        </div>

        {!scrollState.atStart ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-gray-900 dark:via-gray-900/85 md:block" />
        ) : null}

        <button
          type="button"
          aria-label={`Scroll ${scrollTargetLabel} left`}
          onClick={() => scrollByOffset(-240)}
          className={classNames(
            'pointer-events-auto absolute inset-y-0 left-0 hidden w-10 cursor-pointer items-center justify-center rounded-r-md bg-white/95 text-gray-600 shadow-[0_8px_20px_rgba(15,23,42,0.15)] backdrop-blur transition hover:text-gray-900 dark:bg-gray-900/95 dark:text-gray-300 dark:hover:text-gray-100 md:flex',
            scrollState.atStart ? 'opacity-0' : 'opacity-100'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {!scrollState.atEnd ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-white via-white/85 to-transparent dark:from-gray-900 dark:via-gray-900/85 md:block" />
        ) : null}

        <button
          type="button"
          aria-label={`Scroll ${scrollTargetLabel} right`}
          onClick={() => scrollByOffset(240)}
          className={classNames(
            'pointer-events-auto absolute inset-y-0 right-0 hidden w-10 cursor-pointer items-center justify-center rounded-l-md bg-white/95 text-gray-600 shadow-[0_8px_20px_rgba(15,23,42,0.15)] backdrop-blur transition hover:text-gray-900 dark:bg-gray-900/95 dark:text-gray-300 dark:hover:text-gray-100 md:flex',
            scrollState.atEnd ? 'opacity-0' : 'opacity-100'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {description ? <span className="text-xs text-subtle">{description}</span> : null}
    </div>
  );
};

export default ScrollableTabRow;
