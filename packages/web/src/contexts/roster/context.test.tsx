import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RosterProvider } from './context';
import { useRoster } from './use-roster-context';
import { createMockRoster } from '@/test/mock-data';

// Mock offline storage using vi.hoisted for proper scoping
const mockOfflineStorage = vi.hoisted(() => ({
  getRoster: vi.fn(),
  saveRoster: vi.fn()
}));

const mockToastContext = vi.hoisted(() => ({
  dispatch: vi.fn(),
  showToast: vi.fn(),
  removeToast: vi.fn(),
  clearAllToasts: vi.fn()
}));

vi.mock('../../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

vi.mock('@/contexts/toast/use-toast-context', () => ({
  useToast: () => ({
    state: { toasts: [] },
    dispatch: mockToastContext.dispatch,
    showToast: mockToastContext.showToast,
    removeToast: mockToastContext.removeToast,
    clearAllToasts: mockToastContext.clearAllToasts
  })
}));

// Test component to consume the context
const TestComponent = ({ rosterId: _rosterId }: { rosterId?: string }) => {
  const { state, createRoster } = useRoster();

  const handleCreateRoster = () => {
    const newId = createRoster({
      name: 'Test Roster',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        path: '/data/space-marines.json',
        datasheetCount: 50,
        detachmentCount: 4
      },
      maxPoints: 2000,
      detachment: {
        slug: 'test-detachment',
        name: 'Test Detachment',
        abilities: [],
        enhancements: [],
        stratagems: []
      }
    });
    return newId;
  };

  return (
    <div>
      <div data-testid="roster-id">{state.id}</div>
      <div data-testid="roster-name">{state.name}</div>
      <div data-testid="roster-faction">{state.faction?.name}</div>
      <div data-testid="roster-points">
        {state.points.current}/{state.points.max}
      </div>
      <button data-testid="create-roster" onClick={handleCreateRoster}>
        Create Roster
      </button>
    </div>
  );
};

// Test wrapper with RosterProvider
const TestWrapper = ({ rosterId, children }: { rosterId?: string; children: ReactNode }) => (
  <RosterProvider rosterId={rosterId}>{children}</RosterProvider>
);

describe('RosterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty roster state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('roster-id')).toHaveTextContent('');
    expect(screen.getByTestId('roster-name')).toHaveTextContent('');
    expect(screen.getByTestId('roster-faction')).toBeEmptyDOMElement();
    expect(screen.getByTestId('roster-points')).toHaveTextContent('0/2000');
  });

  it('should load roster from storage when rosterId is provided', async () => {
    const testRoster = createMockRoster({
      id: 'test-roster-id',
      name: 'Test Roster',
      points: { current: 500, max: 2000 }
    });

    mockOfflineStorage.getRoster.mockResolvedValue(testRoster);

    render(
      <TestWrapper rosterId="test-roster-id">
        <TestComponent rosterId="test-roster-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('roster-id')).toHaveTextContent('test-roster-id');
      expect(screen.getByTestId('roster-name')).toHaveTextContent('Test Roster');
      expect(screen.getByTestId('roster-faction')).toHaveTextContent('Space Marines');
      // persisted total should be normalised via calculateTotalPoints
      expect(screen.getByTestId('roster-points')).toHaveTextContent('80/2000');
    });

    expect(mockOfflineStorage.getRoster).toHaveBeenCalledWith('test-roster-id');
  });

  it('should handle storage errors gracefully when loading roster', async () => {
    const error = new Error('Storage error');
    mockOfflineStorage.getRoster.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper rosterId="test-roster-id">
        <TestComponent rosterId="test-roster-id" />
      </TestWrapper>
    );

    // Should remain in initial state on error
    await waitFor(() => {
      expect(screen.getByTestId('roster-id')).toHaveTextContent('');
    });

    expect(mockOfflineStorage.getRoster).toHaveBeenCalledWith('test-roster-id');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load roster:', error);

    consoleSpy.mockRestore();
  });

  it('should create new roster with generated ID', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      screen.getByTestId('create-roster').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('roster-name')).toHaveTextContent('Test Roster');
      expect(screen.getByTestId('roster-faction')).toHaveTextContent('Space Marines');
      expect(screen.getByTestId('roster-points')).toHaveTextContent('0/2000');
    });

    // Should have generated a UUID
    const rosterId = screen.getByTestId('roster-id').textContent;
    expect(rosterId).toBeTruthy();
    expect(rosterId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should auto-save roster changes to storage', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      screen.getByTestId('create-roster').click();
    });

    await waitFor(() => {
      expect(mockOfflineStorage.saveRoster).toHaveBeenCalled();
    });

    const savedRoster = mockOfflineStorage.saveRoster.mock.calls[0][0];
    expect(savedRoster).toMatchObject({
      name: 'Test Roster',
      factionId: 'SM',
      factionSlug: 'space-marines',
      points: { current: 0, max: 2000 }
    });
  });

  it('should not save initial empty state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should not save immediately since state.id is empty
    expect(mockOfflineStorage.saveRoster).not.toHaveBeenCalled();
  });

  it('should surface auto-save failures via toast notifications', async () => {
    const error = new Error('IndexedDB write failure');
    mockOfflineStorage.saveRoster.mockRejectedValueOnce(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      screen.getByTestId('create-roster').click();
    });

    await waitFor(() => {
      expect(mockToastContext.showToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Failed to save roster',
        message: 'Changes may not be saved. Please try again.'
      });
    });

    expect(mockOfflineStorage.saveRoster).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to auto-save roster'),
      error
    );

    consoleSpy.mockRestore();
  });
});
