import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ModelProfileTable from './model-profile-table';
import { depot } from 'depot-core';

describe('ModelProfileTable', () => {
  const mockModels: depot.Model[] = [
    {
      line: 1,
      name: 'Captain',
      m: '6"',
      t: '4',
      sv: '3+',
      w: '4',
      ld: '6+',
      oc: '1',
      baseSize: '32mm'
    },
    {
      line: 2,
      name: 'Lieutenant',
      m: '5"',
      t: '4',
      sv: '3+',
      w: '3',
      ld: '7+',
      oc: '1',
      baseSize: '32mm'
    }
  ];

  it('renders table with correct headers', () => {
    render(<ModelProfileTable models={mockModels} />);

    expect(screen.getByText('Unit Profile')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('Sv')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Ld')).toBeInTheDocument();
    expect(screen.getByText('OC')).toBeInTheDocument();
  });

  it('renders model data correctly', () => {
    render(<ModelProfileTable models={mockModels} />);

    // Check that both model names are present
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Lieutenant')).toBeInTheDocument();
    
    // Check unique values to avoid duplicates
    expect(screen.getByText('6"')).toBeInTheDocument(); // Captain's movement
    expect(screen.getByText('5"')).toBeInTheDocument(); // Lieutenant's movement
    expect(screen.getByText('6+')).toBeInTheDocument(); // Captain's leadership
    expect(screen.getByText('7+')).toBeInTheDocument(); // Lieutenant's leadership
  });

  it('renders multiple models in separate rows', () => {
    render(<ModelProfileTable models={mockModels} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // Header + 2 data rows
  });

  it('renders nothing when no models provided', () => {
    const { container } = render(<ModelProfileTable models={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling classes', () => {
    render(<ModelProfileTable models={mockModels} />);

    // Check that name column has font-medium class
    const nameCell = screen.getByText('Captain');
    expect(nameCell).toHaveClass('font-medium');
  });

  it('renders single model correctly', () => {
    const singleModel = [mockModels[0]];
    render(<ModelProfileTable models={singleModel} />);

    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.queryByText('Lieutenant')).not.toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // Header + 1 data row
  });

  it('handles models with different stat values', () => {
    const modelWithDifferentStats: depot.Model[] = [
      {
        line: 1,
        name: 'Dreadnought',
        m: '8"',
        t: '9',
        sv: '2+',
        w: '12',
        ld: '6+',
        oc: '3',
        baseSize: '90mm oval'
      }
    ];

    render(<ModelProfileTable models={modelWithDifferentStats} />);

    expect(screen.getByText('Dreadnought')).toBeInTheDocument();
    expect(screen.getByText('8"')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('2+')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});