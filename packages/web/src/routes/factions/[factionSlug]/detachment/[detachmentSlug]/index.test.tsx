import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFaction, toFactionManifest } from '@/test/mock-data';
import { TestWrapper, setupBrowserMocks } from '@/test/test-utils';
import useFaction from '@/hooks/use-faction';
import DetachmentPage from './index';

vi.mock('@/hooks/use-faction');

let params = { factionSlug: 'space-marines', detachmentSlug: 'gladius-task-force' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => params };
});

const mockedUseFaction = vi.mocked(useFaction);

describe('DetachmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
    params = { factionSlug: 'space-marines', detachmentSlug: 'gladius-task-force' };
    mockedUseFaction.mockReturnValue({
      data: toFactionManifest(mockFaction),
      loading: false,
      error: null
    });
  });

  it('renders the detachment header, meta and rule sections', () => {
    render(
      <TestWrapper>
        <DetachmentPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Gladius Task Force' })).toBeInTheDocument();
    expect(screen.getByTestId('detachment-meta')).toHaveTextContent('2 DP');
    expect(screen.getByTestId('detachment-chapter-dp')).toHaveTextContent('Black Templars 2 DP');
    expect(screen.getByTestId('detachment-abilities')).toHaveTextContent('Combat Doctrines');
    expect(screen.getByTestId('detachment-enhancements')).toHaveTextContent('Artificer Armour');
    expect(screen.getByTestId('detachment-stratagems')).toHaveTextContent(/rapid fire/i);
    expect(screen.getByTestId('bookmark-detachment-button')).toBeInTheDocument();
  });

  it('shows not found for an unknown detachment slug', () => {
    params = { factionSlug: 'space-marines', detachmentSlug: 'nope' };
    render(
      <TestWrapper>
        <DetachmentPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('detachment-not-found')).toBeInTheDocument();
  });

  it('shows the loader while the faction loads', () => {
    mockedUseFaction.mockReturnValue({ data: undefined, loading: true, error: null });
    render(
      <TestWrapper>
        <DetachmentPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('detachment-loader')).toBeInTheDocument();
  });
});
