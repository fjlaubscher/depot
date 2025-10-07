import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';

beforeAll(() => {
  if (!import.meta.env.VITE_APP_VERSION) {
    (import.meta.env as Record<string, string>).VITE_APP_VERSION = 'test';
  }
});

// Mock IndexedDB globally for all tests
const mockIDBDatabase = {
  transaction: vi.fn().mockReturnValue({
    objectStore: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue({
        onsuccess: null,
        onerror: null,
        result: null
      }),
      put: vi.fn().mockReturnValue({
        onsuccess: null,
        onerror: null
      }),
      delete: vi.fn().mockReturnValue({
        onsuccess: null,
        onerror: null
      }),
      clear: vi.fn().mockReturnValue({
        onsuccess: null,
        onerror: null
      }),
      openCursor: vi.fn().mockReturnValue({
        onsuccess: null,
        onerror: null
      })
    })
  }),
  close: vi.fn(),
  objectStoreNames: {
    contains: vi.fn().mockReturnValue(false)
  }
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
  result: mockIDBDatabase
};

// Mock IndexedDB
Object.defineProperty(global, 'indexedDB', {
  value: {
    open: vi.fn().mockReturnValue(mockIDBRequest),
    deleteDatabase: vi.fn().mockReturnValue(mockIDBRequest)
  },
  writable: true
});

// Setup and cleanup for each test
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
