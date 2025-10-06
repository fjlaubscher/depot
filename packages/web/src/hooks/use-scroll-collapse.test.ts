import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';

import { useScrollCollapse } from './use-scroll-collapse';

describe('useScrollCollapse', () => {
  let appContent: HTMLDivElement | null = null;
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof window.cancelAnimationFrame;
  let frameCallback: FrameRequestCallback | null = null;
  let frameId = 0;
  let originalWindowScrollTo: typeof window.scrollTo;

  beforeAll(() => {
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    originalWindowScrollTo = window.scrollTo;
  });

  beforeEach(() => {
    frameCallback = null;
    frameId = 0;

    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallback = callback;
      frameId += 1;
      return frameId;
    }) as unknown as typeof window.requestAnimationFrame;

    window.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    appContent = null;
    window.scrollTo = originalWindowScrollTo;
    vi.clearAllMocks();
  });

  afterAll(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  const appendAppContent = () => {
    appContent = document.createElement('div');
    appContent.id = 'app-content';
    document.body.appendChild(appContent);

    const scrollSpy = vi.fn(({ top }: ScrollToOptions) => {
      if (typeof top === 'number') {
        appContent!.scrollTop = top;
      }
    });

    Object.assign(appContent, { scrollTo: scrollSpy });

    return scrollSpy;
  };

  it('tracks scroll position within the resolved container', async () => {
    const scrollSpy = appendAppContent();

    const { result } = renderHook(() => useScrollCollapse());

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(true);
    });

    act(() => {
      appContent!.scrollTop = 10;
      appContent!.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(false);
    });

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });

    act(() => {
      appContent!.scrollTop = 0;
      appContent!.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(true);
    });
  });

  it('respects custom threshold before marking as scrolled', async () => {
    appendAppContent();

    const { result } = renderHook(() => useScrollCollapse({ threshold: 5 }));

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(true);
    });

    act(() => {
      appContent!.scrollTop = 3;
      appContent!.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(true);
    });

    act(() => {
      appContent!.scrollTop = 6;
      appContent!.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(false);
    });
  });

  it('falls back to window scrolling when no container is found', () => {
    const windowScrollSpy = vi.fn();
    window.scrollTo = windowScrollSpy;

    const { result, unmount } = renderHook(() => useScrollCollapse());

    act(() => {
      result.current.scrollToTop();
    });

    expect(windowScrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });

    expect(window.requestAnimationFrame).toHaveBeenCalled();

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(frameId);
  });

  it('eventually resolves container via animation frame when sentinel becomes available', async () => {
    const main = document.createElement('main');
    document.body.appendChild(main);

    const sentinel = document.createElement('div');
    main.appendChild(sentinel);

    const scrollSpy = vi.fn(({ top }: ScrollToOptions) => {
      if (typeof top === 'number') {
        main.scrollTop = top;
      }
    });

    Object.assign(main, { scrollTo: scrollSpy });

    const { result, rerender } = renderHook(() => useScrollCollapse());

    // Attach sentinel after initial render
    act(() => {
      result.current.sentinelRef.current = sentinel;
    });

    // Trigger the queued animation frame to resolve the container
    act(() => {
      frameCallback?.(performance.now());
    });

    // Re-render to consume updated state
    rerender();

    expect(result.current.isAtTop).toBe(true);

    act(() => {
      main.scrollTop = 15;
      main.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isAtTop).toBe(false);
    });

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });
  });
});
