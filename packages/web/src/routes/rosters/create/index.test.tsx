import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import { mockFactionIndexes, mockFaction } from '@/test/mock-data';
import CreateRoster from './index';

// Mock AppLayout to avoid sidebar duplication
vi.mock('@/components/layout', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="app-layout" data-title={title}>
      {children}
    </div>
  )
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock useFactions hook
const mockUseFactions = vi.hoisted(() => ({
  factions: [] as depot.Index[],
  loading: false,
  error: null
}));

vi.mock('@/hooks/use-factions', () => ({
  default: () => mockUseFactions
}));

// Mock useFaction hook
const mockUseFaction = vi.hoisted(() => ({
  data: null as depot.FactionManifest | null,
  loading: false,
  error: null
}));

vi.mock('@/hooks/use-faction', () => ({
  default: () => mockUseFaction
}));

// Mock useRoster hook
const mockUseRoster = vi.hoisted(() => ({
  createRoster: vi.fn()
}));

vi.mock('@/contexts/roster/use-roster-context', () => ({
  useRoster: () => mockUseRoster
}));

// Mock useToast hook
const mockShowToast = vi.fn();
vi.mock('@/contexts/toast/use-toast-context', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

describe('CreateRoster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFactions.factions = mockFactionIndexes;
    mockUseFactions.loading = false;
    mockUseFactions.error = null;
    mockUseFaction.data = {
      id: mockFaction.id,
      slug: mockFaction.slug,
      name: mockFaction.name,
      link: mockFaction.link,
      datasheets: mockFaction.datasheets.map((ds) => ({
        id: ds.id,
        slug: ds.slug,
        name: ds.name,
        factionId: ds.factionId,
        factionSlug: ds.factionSlug,
        role: ds.role,
        path: `/data/factions/${ds.factionSlug}/datasheets/${ds.id}.json`,
        supplementSlug: ds.supplementSlug,
        supplementName: ds.supplementName,
        link: ds.link,
        isForgeWorld: ds.isForgeWorld,
        isLegends: ds.isLegends
      })),
      detachments: mockFaction.detachments,
      datasheetCount: mockFaction.datasheets.length,
      detachmentCount: mockFaction.detachments.length
    };
    mockUseFaction.loading = false;
    mockUseFaction.error = null;
    mockUseRoster.createRoster.mockReturnValue('new-roster-id');
  });

  it('renders form with all required fields', () => {
    render(<CreateRoster />, { wrapper: TestWrapper });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('roster-form')).toBeInTheDocument();
    expect(screen.getByTestId('roster-name-field')).toBeInTheDocument();
    expect(screen.getByTestId('faction-field')).toBeInTheDocument();
    expect(screen.getByTestId('max-points-field')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('shows loading skeleton while factions are loading', () => {
    mockUseFactions.loading = true;

    render(<CreateRoster />, { wrapper: TestWrapper });

    expect(screen.getByTestId('field-skeleton')).toBeInTheDocument();
  });

  it('shows faction select field when factions are loaded', async () => {
    render(<CreateRoster />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId('faction-field')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('field-skeleton')).not.toBeInTheDocument();
  });

  it('validates required roster name', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    // Fill with whitespace-only name to bypass disabled button but trigger validation
    const nameInput = screen.getByTestId('roster-name-input');
    const factionSelect = screen.getByTestId('faction-field-select');
    await user.type(nameInput, '   '); // Whitespace only
    await user.selectOptions(factionSelect, 'space-marines');

    // Wait for detachment field to appear and select it
    await waitFor(() => {
      expect(screen.getByTestId('detachment-field-select')).toBeInTheDocument();
    });
    const detachmentSelect = screen.getByTestId('detachment-field-select');
    await user.selectOptions(detachmentSelect, 'Gladius Task Force');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Validation Error',
      message: 'Please enter a roster name.'
    });
    expect(mockUseRoster.createRoster).not.toHaveBeenCalled();
  });

  it('validates required faction selection', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    const nameInput = screen.getByTestId('roster-name-input');
    await user.type(nameInput, 'Test Roster');

    // Leave faction unselected (should stay as empty value)
    const submitButton = screen.getByTestId('submit-button');

    // Submit button should be disabled when no faction is selected
    expect(submitButton).toBeDisabled();

    // Verify the showToast isn't called since form can't be submitted
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockUseRoster.createRoster).not.toHaveBeenCalled();
  });

  it('validates positive max points', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    const nameInput = screen.getByTestId('roster-name-input');
    const factionSelect = screen.getByTestId('faction-field-select');
    const maxPointsSelect = screen.getByTestId('max-points-field-select');

    await user.type(nameInput, 'Test Roster');
    await user.selectOptions(factionSelect, 'space-marines');
    await user.selectOptions(maxPointsSelect, 'custom');

    const pointsInput = await screen.findByTestId('max-points-input');
    pointsInput.removeAttribute('min');
    pointsInput.removeAttribute('required');

    // Wait for detachment field to appear and select it
    await waitFor(() => {
      expect(screen.getByTestId('detachment-field-select')).toBeInTheDocument();
    });
    const detachmentSelect = screen.getByTestId('detachment-field-select');
    await user.selectOptions(detachmentSelect, 'Gladius Task Force');

    await user.clear(pointsInput);
    await user.type(pointsInput, '0');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Validation Error',
        message: 'Max points must be greater than 0.'
      });
    });
    expect(mockUseRoster.createRoster).not.toHaveBeenCalled();
  });

  it('trims whitespace from roster name', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    const nameInput = screen.getByTestId('roster-name-input');
    const factionSelect = screen.getByTestId('faction-field-select');

    await user.type(nameInput, '  Test Roster  ');
    await user.selectOptions(factionSelect, 'space-marines');

    // Wait for detachment field to appear and select it
    await waitFor(() => {
      expect(screen.getByTestId('detachment-field-select')).toBeInTheDocument();
    });
    const detachmentSelect = screen.getByTestId('detachment-field-select');
    await user.selectOptions(detachmentSelect, 'Gladius Task Force');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(mockUseRoster.createRoster).toHaveBeenCalledWith({
      name: 'Test Roster',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: expect.objectContaining({
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines'
      }),
      maxPoints: 2000,
      detachment: expect.any(Object)
    });
  });

  it('creates roster and navigates on successful submission', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    const nameInput = screen.getByTestId('roster-name-input');
    const factionSelect = screen.getByTestId('faction-field-select');
    const maxPointsSelect = screen.getByTestId('max-points-field-select');

    await user.type(nameInput, 'My Awesome Roster');
    await user.selectOptions(factionSelect, 'space-marines');
    await user.selectOptions(maxPointsSelect, 'custom');

    const pointsInput = await screen.findByTestId('max-points-input');

    // Wait for detachment field to appear and select it
    await waitFor(() => {
      expect(screen.getByTestId('detachment-field-select')).toBeInTheDocument();
    });
    const detachmentSelect = screen.getByTestId('detachment-field-select');
    await user.selectOptions(detachmentSelect, 'Gladius Task Force');

    await user.clear(pointsInput);
    await user.type(pointsInput, '1500');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(mockUseRoster.createRoster).toHaveBeenCalledWith({
      name: 'My Awesome Roster',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: expect.objectContaining({
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines'
      }),
      maxPoints: 1500,
      detachment: expect.any(Object)
    });
    expect(mockNavigate).toHaveBeenCalledWith('/rosters/new-roster-id/edit');
  });

  it('navigates back to rosters list when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/rosters');
  });

  it('disables submit button when factions are loading', () => {
    mockUseFactions.loading = true;

    render(<CreateRoster />, { wrapper: TestWrapper });

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<CreateRoster />, { wrapper: TestWrapper });

    const submitButton = screen.getByTestId('submit-button');

    // Initially disabled (no name or faction)
    expect(submitButton).toBeDisabled();

    // Still disabled with only name
    const nameInput = screen.getByTestId('roster-name-input');
    await user.type(nameInput, 'Test');
    expect(submitButton).toBeDisabled();

    // Still disabled with name and faction (no detachment)
    const factionSelect = screen.getByTestId('faction-field-select');
    await user.selectOptions(factionSelect, 'space-marines');
    expect(submitButton).toBeDisabled();

    // Enabled with name, faction, and detachment
    await waitFor(() => {
      expect(screen.getByTestId('detachment-field-select')).toBeInTheDocument();
    });
    const detachmentSelect = screen.getByTestId('detachment-field-select');
    await user.selectOptions(detachmentSelect, 'Gladius Task Force');
    expect(submitButton).not.toBeDisabled();
  });

  it('uses default max points of 2000', () => {
    render(<CreateRoster />, { wrapper: TestWrapper });

    const maxPointsSelect = screen.getByTestId('max-points-field-select') as HTMLSelectElement;
    expect(maxPointsSelect.value).toBe('strike-force');
    expect(screen.queryByTestId('max-points-input')).not.toBeInTheDocument();
  });

  it('handles empty faction list gracefully', () => {
    mockUseFactions.factions = [];

    render(<CreateRoster />, { wrapper: TestWrapper });

    const factionSelect = screen.getByTestId('faction-field-select');
    expect(factionSelect).toBeInTheDocument();
    // Should show placeholder but no options
    expect(factionSelect.children.length).toBe(1); // Just the placeholder
  });
});
