import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { depot } from '@depot/core';
import UnitDetails from './unit-details';
import { TestWrapper } from '@/test/test-utils';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  default: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  )
}));

describe('UnitDetails', () => {
  const mockUnitComposition: depot.UnitComposition[] = [
    { line: '1', description: '1 Captain', datasheetId: 'SM_CAPTAIN' }
  ];

  const mockOptions: depot.DatasheetOption[] = [
    {
      line: '1',
      description: 'This model may be equipped with a jump pack',
      button: '-',
      datasheetId: 'SM_CAPTAIN'
    }
  ];

  const mockModels: depot.Model[] = [
    {
      line: '1',
      name: 'Captain',
      m: '6"',
      t: '4',
      sv: '3+',
      w: '5',
      ld: '6+',
      oc: '1',
      baseSize: '40mm',
      baseSizeDescr: '40mm Round',
      datasheetId: 'SM_CAPTAIN'
    }
  ];

  it('renders unit composition when provided', () => {
    render(<UnitDetails unitComposition={mockUnitComposition} options={[]} models={mockModels} />, {
      wrapper: TestWrapper
    });

    expect(screen.getByTestId('unit-composition')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders unit options when provided', () => {
    render(<UnitDetails unitComposition={[]} options={mockOptions} models={mockModels} />, {
      wrapper: TestWrapper
    });

    expect(screen.getByTestId('unit-options')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders both sections when both are provided', () => {
    render(
      <UnitDetails
        unitComposition={mockUnitComposition}
        options={mockOptions}
        models={mockModels}
      />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByTestId('unit-composition')).toBeInTheDocument();
    expect(screen.getByTestId('unit-options')).toBeInTheDocument();
    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  it('returns null when neither composition nor options are provided', () => {
    const { container } = render(
      <UnitDetails unitComposition={[]} options={[]} models={mockModels} />,
      { wrapper: TestWrapper }
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles empty unit composition', () => {
    render(<UnitDetails unitComposition={[]} options={mockOptions} models={mockModels} />, {
      wrapper: TestWrapper
    });

    expect(screen.queryByTestId('unit-composition')).not.toBeInTheDocument();
    expect(screen.getByTestId('unit-options')).toBeInTheDocument();
  });

  it('handles empty unit options', () => {
    render(<UnitDetails unitComposition={mockUnitComposition} options={[]} models={mockModels} />, {
      wrapper: TestWrapper
    });

    expect(screen.getByTestId('unit-composition')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-options')).not.toBeInTheDocument();
  });
});
