import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('disables submit button when factions are loading', () => {
    mockUseFactions.loading = true;

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

  it('handles empty faction list gracefully', () => {
    mockUseFactions.factions = [];

    render(<CreateRoster />, { wrapper: TestWrapper });

    const factionSelect = screen.getByTestId('faction-field-select');
    expect(factionSelect).toBeInTheDocument();
    // Should show placeholder but no options
    expect(factionSelect.children.length).toBe(1); // Just the placeholder
  });
});
