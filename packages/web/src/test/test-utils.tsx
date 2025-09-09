import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LayoutProvider } from '@/contexts/layout/context';
import { ToastProvider } from '@/contexts/toast/context';
import { AppProvider } from '@/contexts/app/context';

/**
 * Test utilities for consistent testing setup
 */

// Common test wrapper with all required providers - uses MemoryRouter for isolated testing
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <AppProvider>
      <ToastProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </ToastProvider>
    </AppProvider>
  </MemoryRouter>
);

// Mock functions factory
export const createMockFunctions = () => ({
  mockUseFaction: vi.fn(),
  mockNavigate: vi.fn(),
  mockShowToast: vi.fn(),
  mockUseToastContext: vi.fn(),
  mockAppContext: {
    state: {
      factionIndex: null,
      offlineFactions: [],
      myFactions: [],
      loading: false,
      error: null,
      settings: null
    },
    dispatch: vi.fn(),
    getFaction: vi.fn(),
    clearOfflineData: vi.fn(),
    updateSettings: vi.fn(),
    updateMyFactions: vi.fn()
  }
});

// Common mock setup for hooks
export const setupCommonMocks = async (mocks: ReturnType<typeof createMockFunctions>) => {
  const { mockUseFaction, mockUseToastContext, mockShowToast } = mocks;

  // Setup toast context mock
  mockUseToastContext.mockReturnValue({
    showToast: mockShowToast,
    removeToast: vi.fn(),
    clearAllToasts: vi.fn(),
    state: { toasts: [] },
    dispatch: vi.fn()
  });

  // Apply mocks
  const useFactionMock = await import('@/hooks/use-faction');
  vi.mocked(useFactionMock.default).mockImplementation(mockUseFaction);

  const useToastMock = await import('@/contexts/toast/use-toast-context');
  vi.mocked(useToastMock.useToast).mockImplementation(mockUseToastContext);

  return mocks;
};

// Mock browser APIs
export const setupBrowserMocks = () => {
  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  });

  // Mock Web Share API (optional)
  Object.assign(navigator, {
    share: vi.fn().mockResolvedValue(undefined)
  });
};
