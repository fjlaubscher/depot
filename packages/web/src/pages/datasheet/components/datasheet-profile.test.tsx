import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { depot } from "@depot/core";
import DatasheetProfile from './datasheet-profile';
import { mockDatasheet, createMockDatasheet } from '@/test/mock-data';
import { TestWrapper } from '@/test/test-utils';

// Mock child components to focus on DatasheetProfile logic
vi.mock('./model-profile-table', () => ({
  default: ({ models }: { models: any[] }) => (
    <div data-testid="model-profile-table">Models: {models.length}</div>
  )
}));

vi.mock('./wargear-table', () => ({
  default: ({ wargear, type }: { wargear: any[]; type: string }) => (
    <div data-testid={`wargear-table-${type.toLowerCase()}`}>{type} Wargear Table</div>
  )
}));

// Mock utility functions
vi.mock('@/utils/array', () => ({
  sortByName: (items: any[]) => items.sort((a, b) => a.name.localeCompare(b.name))
}));

vi.mock('@/utils/keywords', () => ({
  groupKeywords: (keywords: depot.Keyword[]) => ({
    datasheet: keywords.filter((k) => k.isFactionKeyword !== 'true').map((k) => k.keyword),
    faction: keywords.filter((k) => k.isFactionKeyword === 'true').map((k) => k.keyword)
  })
}));

describe('DatasheetProfile', () => {
  it('renders all sections with mock datasheet', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('datasheet-profile')).toBeInTheDocument();
    expect(screen.getByTestId('model-profile-table')).toBeInTheDocument();
    expect(screen.getByText('Models: 2')).toBeInTheDocument();
  });

  it('renders wargear tables for ranged and melee weapons', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('wargear-table-ranged')).toBeInTheDocument();
    expect(screen.getByText('Ranged Wargear Table')).toBeInTheDocument();

    expect(screen.getByTestId('wargear-table-melee')).toBeInTheDocument();
    expect(screen.getByText('Melee Wargear Table')).toBeInTheDocument();
  });

  it('renders unit composition section', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    const unitComposition = screen.getByTestId('unit-composition');
    expect(unitComposition).toBeInTheDocument();
    expect(unitComposition).toHaveTextContent('Unit Composition');
    expect(unitComposition).toHaveTextContent('1 Captain');
  });

  it('renders unit options section', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    const unitOptions = screen.getByTestId('unit-options');
    expect(unitOptions).toBeInTheDocument();
    expect(unitOptions).toHaveTextContent('Unit Options');
    expect(unitOptions).toHaveTextContent('This model may be equipped with a jump pack');
  });

  it('renders abilities section', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    const abilities = screen.getByTestId('abilities');
    expect(abilities).toBeInTheDocument();
    expect(abilities).toHaveTextContent('Abilities');
    expect(abilities).toHaveTextContent('Leader');
    expect(abilities).toHaveTextContent('This model can be attached to a unit');
  });

  it('renders keywords sections', () => {
    render(<DatasheetProfile datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    const keywords = screen.getByTestId('keywords');
    expect(keywords).toBeInTheDocument();
    expect(keywords).toHaveTextContent('Keywords');

    const factionKeywords = screen.getByTestId('faction-keywords');
    expect(factionKeywords).toBeInTheDocument();
    expect(factionKeywords).toHaveTextContent('Faction Keywords');
  });

  it('handles empty unit composition', () => {
    const datasheetWithoutComposition = createMockDatasheet({
      unitComposition: []
    });

    render(<DatasheetProfile datasheet={datasheetWithoutComposition} />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('unit-composition')).not.toBeInTheDocument();
  });

  it('handles empty unit options', () => {
    const datasheetWithoutOptions = createMockDatasheet({
      options: []
    });

    render(<DatasheetProfile datasheet={datasheetWithoutOptions} />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('unit-options')).not.toBeInTheDocument();
  });

  it('handles empty abilities', () => {
    const datasheetWithoutAbilities = createMockDatasheet({
      abilities: []
    });

    render(<DatasheetProfile datasheet={datasheetWithoutAbilities} />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('abilities')).not.toBeInTheDocument();
  });

  it('filters options with descriptions', () => {
    const datasheetWithEmptyOptions = createMockDatasheet({
      options: [
        { line: '1', description: 'Valid option', button: '-', datasheetId: 'SM_CAPTAIN' },
        { line: '2', description: '', button: '-', datasheetId: 'SM_CAPTAIN' }, // Should be filtered out
        { line: '3', description: 'Another valid option', button: '-', datasheetId: 'SM_CAPTAIN' }
      ]
    });

    render(<DatasheetProfile datasheet={datasheetWithEmptyOptions} />, { wrapper: TestWrapper });

    expect(screen.getByText('Valid option')).toBeInTheDocument();
    expect(screen.getByText('Another valid option')).toBeInTheDocument();
    expect(screen.queryByText('line 2')).not.toBeInTheDocument();
  });

  it('calls wargear tables with correct weapon types', () => {
    const datasheetWithMixedWargear = createMockDatasheet({
      wargear: [
        {
          line: '1',
          name: 'Bolt pistol',
          type: 'Ranged',
          range: '12',
          a: '1',
          bsWs: '2',
          s: '4',
          ap: '0',
          d: '1',
          description: '',
          datasheetId: 'SM_CAPTAIN',
          dice: '',
          lineInWargear: ''
        },
        {
          line: '2',
          name: 'Power sword',
          type: 'Melee',
          range: '',
          a: '4',
          bsWs: '2',
          s: '5',
          ap: '-2',
          d: '2',
          description: '',
          datasheetId: 'SM_CAPTAIN',
          dice: '',
          lineInWargear: ''
        }
      ]
    });

    render(<DatasheetProfile datasheet={datasheetWithMixedWargear} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('wargear-table-ranged')).toBeInTheDocument();
    expect(screen.getByTestId('wargear-table-melee')).toBeInTheDocument();
  });
});
