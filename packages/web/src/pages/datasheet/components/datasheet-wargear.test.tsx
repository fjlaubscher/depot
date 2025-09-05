import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DatasheetWargear from './datasheet-wargear';
import { createMockDatasheet } from '@/test/mock-data';
import { TestWrapper } from '@/test/test-utils';

// Mock the table components
vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children }: any) => <tr data-testid="table-row">{children}</tr>,
  TableHead: ({ children }: any) => <th data-testid="table-head">{children}</th>,
  TableCell: ({ children }: any) => <td data-testid="table-cell">{children}</td>,
  tableStyles: {
    noWrap: 'nowrap',
    center: 'center',
    numeric: 'numeric'
  }
}));

describe('DatasheetWargear', () => {
  const mockDatasheet = createMockDatasheet({
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
        description: 'Pistol',
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

  it('renders model profile table when models exist', () => {
    render(<DatasheetWargear datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    const tables = screen.getAllByTestId('table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('renders ranged wargear table when ranged weapons exist', () => {
    render(<DatasheetWargear datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('table')).toHaveLength(3); // Model + Ranged + Melee
  });

  it('renders melee wargear table when melee weapons exist', () => {
    render(<DatasheetWargear datasheet={mockDatasheet} />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('table')).toHaveLength(3); // Model + Ranged + Melee
  });

  it('renders only model table when no wargear exists', () => {
    const datasheetWithoutWargear = createMockDatasheet({ wargear: [] });
    render(<DatasheetWargear datasheet={datasheetWithoutWargear} />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('table')).toHaveLength(1); // Only model table
  });

  it('renders only ranged table when only ranged weapons exist', () => {
    const datasheetWithRangedOnly = createMockDatasheet({
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
        }
      ]
    });

    render(<DatasheetWargear datasheet={datasheetWithRangedOnly} />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('table')).toHaveLength(2); // Model + Ranged
  });

  it('renders only melee table when only melee weapons exist', () => {
    const datasheetWithMeleeOnly = createMockDatasheet({
      wargear: [
        {
          line: '1',
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

    render(<DatasheetWargear datasheet={datasheetWithMeleeOnly} />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('table')).toHaveLength(2); // Model + Melee
  });

  it('handles empty models and wargear gracefully', () => {
    const emptyDatasheet = createMockDatasheet({ models: [], wargear: [] });
    const { container } = render(<DatasheetWargear datasheet={emptyDatasheet} />, {
      wrapper: TestWrapper
    });

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
