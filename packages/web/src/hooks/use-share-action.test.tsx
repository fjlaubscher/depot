import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { useShareAction } from './use-share-action';

const showToast = vi.hoisted(() => vi.fn());
vi.mock('@/contexts/toast/context', () => ({ useToast: () => ({ showToast }) }));
vi.mock('@/contexts/settings/context', () => ({
  useSettingsContext: () => ({ settings: { useNativeShare: true } })
}));

afterEach(() => vi.unstubAllGlobals());

describe('share action', () => {
  it('does not copy or announce success after native share cancellation', async () => {
    const writeText = vi.fn();
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')),
      clipboard: { writeText }
    });
    const { result } = renderHook(() => useShareAction({ text: 'Ma liste' }));
    await act(async () => result.current.onClick());
    expect(writeText).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('falls back to the clipboard for an unsuccessful native share', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new Error('unavailable')),
      clipboard: { writeText }
    });
    const { result } = renderHook(() => useShareAction({ text: 'Ma liste' }));
    await act(async () => result.current.onClick());
    expect(writeText).toHaveBeenCalledWith('Ma liste');
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('reports unavailable sharing without a success notification', async () => {
    vi.stubGlobal('navigator', {});
    const { result } = renderHook(() => useShareAction({ text: 'Ma liste' }));
    await act(async () => result.current.onClick());
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });
});
