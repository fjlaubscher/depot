import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

// Mock the factions context consumer hook (keep the real provider for TestWrapper)
const mockFactionsContext = vi.hoisted(() => ({
  factionIndex: [] as depot.Index[],
  loading: false,
  error: null as string | null,
  dataVersion: null as string | null
}));

vi.mock('@/contexts/factions/context', async () => {
  const actual = await vi.importActual('@/contexts/factions/context');
  return {
    ...(actual as object),
    useFactionsContext: () => mockFactionsContext
  };
});

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

describe('CreateRoster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFactionsContext.factionIndex = mockFactionIndexes;
    mockFactionsContext.loading = false;
    mockFactionsContext.error = null;
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
        isSupport: ds.isSupport,
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
    mockFactionsContext.loading = true;

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

  it('disables submit button when factions are loading', () => {
    mockFactionsContext.loading = true;

    render(<CreateRoster />, { wrapper: TestWrapper });

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('uses default max points of 2000', () => {
    render(<CreateRoster />, { wrapper: TestWrapper });

    const maxPointsSelect = screen.getByTestId('max-points-field-select') as HTMLSelectElement;
    expect(maxPointsSelect.value).toBe('strike-force');
    expect(screen.queryByTestId('max-points-input')).not.toBeInTheDocument();
  });

  it('lets you pick multiple detachments and tracks DP against the battle size', () => {
    render(<CreateRoster />, { wrapper: TestWrapper });

    fireEvent.change(screen.getByTestId('faction-field-select'), {
      target: { value: mockFaction.slug }
    });

    expect(screen.getByTestId('detachment-field')).toBeInTheDocument();
    expect(screen.getByTestId('detachment-dp-total')).toHaveTextContent('0 / 3 DP');

    fireEvent.click(screen.getByTestId(`detachment-toggle-${mockFaction.detachments[0].slug}`));
    expect(screen.getByTestId('detachment-dp-total')).toHaveTextContent('2 / 3 DP');
  });

  it('handles empty faction list gracefully', () => {
    mockFactionsContext.factionIndex = [];

    render(<CreateRoster />, { wrapper: TestWrapper });

    const factionSelect = screen.getByTestId('faction-field-select');
    expect(factionSelect).toBeInTheDocument();
    // Should show placeholder but no options
    expect(factionSelect.children.length).toBe(1); // Just the placeholder
  });
});
