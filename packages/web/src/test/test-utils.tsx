import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import { LayoutProvider } from '@/contexts/layout/context';
import { ToastProvider } from '@/contexts/toast/context';
import { AppProvider } from '@/contexts/app-provider';

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

// `Mock`-annotated so the inferred return type stays nameable for declaration emit
const mockFn = (): Mock => vi.fn();

// Mock functions factory
export const createMockFunctions = () => ({
  mockUseFaction: mockFn(),
  mockUseDatasheet: mockFn(),
  mockNavigate: mockFn(),
  mockShowToast: mockFn(),
  mockUseToastContext: mockFn(),
  mockAppContext: {
    state: {
      factionIndex: null,
      offlineFactions: [],
      loading: false,
      error: null,
      settings: null
    },
    dispatch: mockFn(),
    getFactionManifest: mockFn(),
    getDatasheet: mockFn(),
    clearOfflineData: mockFn(),
    updateSettings: mockFn()
  }
});

// Common mock setup for hooks
export const setupCommonMocks = async (mocks: ReturnType<typeof createMockFunctions>) => {
  const { mockUseFaction, mockUseDatasheet, mockUseToastContext, mockShowToast } = mocks;

  // Setup toast context mock
  mockUseToastContext.mockReturnValue({
    showToast: mockShowToast,
    removeToast: vi.fn(),
    state: { toasts: [] }
  });

  // Apply mocks
  const useFactionMock = await import('@/hooks/use-faction');
  vi.mocked(useFactionMock.default).mockImplementation(mockUseFaction);
  const useDatasheetMock = await import('@/hooks/use-datasheet');
  vi.mocked(useDatasheetMock.default).mockImplementation(mockUseDatasheet);

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
