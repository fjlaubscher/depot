import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

interface UseScrollCollapseOptions {
  /**
   * Maximum scrollTop to still consider the container "at top". Defaults to 1 to allow minor jitter.
   */
  threshold?: number;
}

interface UseScrollCollapseResult {
  /** Attach to an empty element near the top of the scroll content. */
  sentinelRef: MutableRefObject<HTMLDivElement | null>;
  /** True while the scroll position is still at the top of the container. */
  isAtTop: boolean;
  /** Smoothly scrolls the resolved container (or window as a fallback) back to the top. */
  scrollToTop: () => void;
}

export const useScrollCollapse = (
  options: UseScrollCollapseOptions = {}
): UseScrollCollapseResult => {
  const { threshold = 1 } = options;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const resolveScrollContainer = () => {
      const sentinel = sentinelRef.current;
      return (document.getElementById('app-content') ??
        sentinel?.closest('main')) as HTMLElement | null;
    };

    const existingContainer = resolveScrollContainer();
    if (existingContainer) {
      setScrollContainer(existingContainer);
      return undefined;
    }

    let animationFrame: number | null = null;

    const ensureContainer = () => {
      const container = resolveScrollContainer();
      if (container) {
        setScrollContainer(container);
        animationFrame = null;
      } else {
        animationFrame = window.requestAnimationFrame(ensureContainer);
      }
    };

    animationFrame = window.requestAnimationFrame(ensureContainer);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!scrollContainer) {
      return undefined;
    }

    const handleScroll = () => {
      setIsAtTop(scrollContainer.scrollTop <= threshold);
    };

    handleScroll();
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainer, threshold]);

  const scrollToTop = useCallback(() => {
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollContainer]);

  return {
    sentinelRef,
    isAtTop,
    scrollToTop
  };
};
