import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { RosterProvider } from './context';
import { useRoster } from './use-roster-context';
import { mockRoster, createMockRoster } from '@/test/mock-data';

// Mock offline storage using vi.hoisted for proper scoping
const mockOfflineStorage = vi.hoisted(() => ({
  getRoster: vi.fn(),
  saveRoster: vi.fn()
}));

vi.mock('../../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

// Test component to consume the context
const TestComponent = ({ rosterId }: { rosterId?: string }) => {
  const { state, createRoster } = useRoster();

  const handleCreateRoster = () => {
    const newId = createRoster({
      name: 'Test Roster',
      factionId: 'SM',
      maxPoints: 2000
    });
    return newId;
  };

  return (
    <div>
      <div data-testid="roster-id">{state.id}</div>
      <div data-testid="roster-name">{state.name}</div>
      <div data-testid="roster-faction">{state.factionId}</div>
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
const TestWrapper = ({ rosterId, children }: { rosterId?: string; children: React.ReactNode }) => (
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
    expect(screen.getByTestId('roster-faction')).toHaveTextContent('');
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
      expect(screen.getByTestId('roster-faction')).toHaveTextContent('SM');
      expect(screen.getByTestId('roster-points')).toHaveTextContent('500/2000');
    });

    expect(mockOfflineStorage.getRoster).toHaveBeenCalledWith('test-roster-id');
  });

  it('should handle storage errors gracefully when loading roster', async () => {
    mockOfflineStorage.getRoster.mockRejectedValue(new Error('Storage error'));

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
      expect(screen.getByTestId('roster-faction')).toHaveTextContent('SM');
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
});
