import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { depot } from '@depot/core';
import DatasheetHero from './datasheet-hero';
import { createMockDatasheet } from '@/test/mock-data';

// Mock child components
vi.mock('./model-stats-row', () => ({
  default: ({ model }: { model: depot.Model }) => (
    <div data-testid={`model-stats-row-${model.line}`}>Model Stats: {model.name}</div>
  )
}));

// Mock UI components
vi.mock('@/components/ui/tag', () => ({
  Tag: ({ children }: any) => <span data-testid="tag">{children}</span>,
  TagGroup: ({ children }: any) => <div data-testid="tag-group">{children}</div>
}));

// Mock utility functions
vi.mock('@/utils/keywords', () => ({
  groupKeywords: (keywords: depot.Keyword[]) => ({
    datasheet: keywords.filter((k) => k.isFactionKeyword !== 'true').map((k) => k.keyword),
    faction: keywords.filter((k) => k.isFactionKeyword === 'true').map((k) => k.keyword)
  })
}));

describe('DatasheetHero', () => {
  const mockDatasheet = createMockDatasheet();

  it('renders model stats rows for all models', () => {
    render(<DatasheetHero datasheet={mockDatasheet} />);

    expect(screen.getByTestId('model-stats-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('model-stats-row-2')).toBeInTheDocument();
  });

  it('displays role tag', () => {
    render(<DatasheetHero datasheet={mockDatasheet} />);

    expect(screen.getAllByTestId('tag').length).toBeGreaterThan(0);
  });

  it('displays cost information when provided', () => {
    const mockCost = {
      line: '1',
      description: 'Base cost',
      cost: '100',
      datasheetId: 'SM_CAPTAIN'
    };

    render(<DatasheetHero datasheet={mockDatasheet} cost={mockCost} />);

    expect(screen.getAllByTestId('tag').length).toBeGreaterThan(0);
  });

  it('handles missing cost gracefully', () => {
    render(<DatasheetHero datasheet={mockDatasheet} />);

    expect(screen.getAllByTestId('tag').length).toBeGreaterThan(0);
  });

  it('displays keyword groups when keywords exist', () => {
    const datasheetWithKeywords = createMockDatasheet({
      keywords: [
        { keyword: 'INFANTRY', isFactionKeyword: 'false', datasheetId: 'SM_CAPTAIN' },
        { keyword: 'IMPERIUM', isFactionKeyword: 'true', datasheetId: 'SM_CAPTAIN' }
      ]
    });

    render(<DatasheetHero datasheet={datasheetWithKeywords} />);

    expect(screen.getAllByTestId('tag-group')).toHaveLength(2);
  });

  it('returns null when no models are provided', () => {
    const datasheetWithoutModels = createMockDatasheet({ models: [] });
    const { container } = render(<DatasheetHero datasheet={datasheetWithoutModels} />);

    expect(container.firstChild).toBeNull();
  });

  it('handles empty keywords gracefully', () => {
    const datasheetWithoutKeywords = createMockDatasheet({ keywords: [] });
    render(<DatasheetHero datasheet={datasheetWithoutKeywords} />);

    expect(screen.getAllByTestId('tag').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('tag-group')).not.toBeInTheDocument();
  });
});
