import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { TestWrapper } from '@/test/test-utils';
import usePersistedTagSelection, { persistTagSelection } from './use-persisted-tag-selection';

describe('usePersistedTagSelection', () => {
  const storageKey = 'test-tag-selection';

  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default value when nothing is stored', () => {
    const { result } = renderHook(() => usePersistedTagSelection<string>(storageKey, 'all'), {
      wrapper: TestWrapper
    });

    expect(result.current.selection).toBe('all');
  });

  it('restores a stored value', () => {
    persistTagSelection(storageKey, 'stored');

    const { result } = renderHook(() => usePersistedTagSelection<string>(storageKey, 'all'), {
      wrapper: TestWrapper
    });

    expect(result.current.selection).toBe('stored');
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(
      () => usePersistedTagSelection<'all' | 'sprue'>(storageKey, 'all'),
      {
        wrapper: TestWrapper
      }
    );

    act(() => {
      result.current.setSelection('sprue');
    });

    expect(localStorage.getItem(`depot:tag-selection:${storageKey}`)).toBe('sprue');
  });

  it('resets invalid stored values using the validator', () => {
    localStorage.setItem(`depot:tag-selection:${storageKey}`, 'invalid');

    const { result } = renderHook(
      () =>
        usePersistedTagSelection<'default' | 'valid'>(
          storageKey,
          'default',
          (value) => value === 'valid'
        ),
      { wrapper: TestWrapper }
    );

    expect(result.current.selection).toBe('default');
  });
});
