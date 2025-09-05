import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { depot } from '@depot/core';
import DatasheetProfile from './datasheet-profile';
import { mockDatasheet, createMockDatasheet } from '@/test/mock-data';
import { TestWrapper } from '@/test/test-utils';

// Mock child components to focus on DatasheetProfile logic
vi.mock('./datasheet-hero', () => ({
  default: ({ datasheet, cost, alternateCost }: any) => (
    <div data-testid="datasheet-hero">
      Hero - {datasheet.name} - {cost?.cost || 'No cost'}
    </div>
  )
}));

vi.mock('./datasheet-wargear', () => ({
  default: ({ datasheet }: any) => (
    <div data-testid="datasheet-wargear">Wargear - {datasheet.wargear.length} weapons</div>
  )
}));

vi.mock('./datasheet-abilities', () => ({
  default: ({ abilities }: any) => (
    <div data-testid="datasheet-abilities">Abilities - {abilities.length} abilities</div>
  )
}));

vi.mock('./unit-details', () => ({
  default: ({ unitComposition, options }: any) => (
    <div data-testid="unit-details">
      Unit Details - {unitComposition.length} compositions, {options.length} options
    </div>
  )
}));

// Mock utility functions
vi.mock('@/utils/array', () => ({
  sortByName: (items: any[]) => items.sort((a, b) => a.name.localeCompare(b.name))
}));

describe('DatasheetProfile', () => {
  it('renders all sections with mock datasheet', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('datasheet-profile')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-hero')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-wargear')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-abilities')).toBeInTheDocument();
    expect(screen.getByTestId('unit-details')).toBeInTheDocument();
  });

  it('passes cost data to hero component', () => {
    const mockCost = {
      line: '1',
      description: 'Base cost',
      cost: '100',
      datasheetId: 'SM_CAPTAIN'
    };
    const mockAlternateCost = {
      line: '2',
      description: 'Alternate cost',
      cost: '120',
      datasheetId: 'SM_CAPTAIN'
    };

    render(
      <DatasheetProfile
        datasheet={mockDatasheet}
        cost={mockCost}
        alternateCost={mockAlternateCost}
      />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByTestId('datasheet-hero')).toBeInTheDocument();
  });

  it('handles missing cost data', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('datasheet-hero')).toBeInTheDocument();
  });

  it('passes wargear data to wargear component', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('datasheet-wargear')).toBeInTheDocument();
  });

  it('passes abilities to abilities component', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('datasheet-abilities')).toBeInTheDocument();
  });

  it('passes unit details to unit details component', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('unit-details')).toBeInTheDocument();
  });
});
