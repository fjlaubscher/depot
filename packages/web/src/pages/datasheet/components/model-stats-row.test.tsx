import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { depot } from '@depot/core';
import ModelStatsRow from './model-stats-row';

// Mock the StatCard component
vi.mock('./stat-card', () => ({
  default: ({ label, value }: { label: string; value: string }) => (
    <div data-testid={`stat-card-${label.toLowerCase()}`}>
      {label}: {value}
    </div>
  )
}));

describe('ModelStatsRow', () => {
  const mockModel: depot.Model = {
    line: '1',
    name: 'Space Marine Captain',
    m: '6"',
    t: '4',
    sv: '3+',
    w: '5',
    ld: '6+',
    oc: '1',
    baseSize: '40mm',
    baseSizeDescr: '40mm Round',
    datasheetId: 'SM_CAPTAIN'
  };

  it('renders all stat cards for a model', () => {
    render(<ModelStatsRow model={mockModel} />);

    expect(screen.getByTestId('stat-card-m')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-t')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-sv')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-w')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-ld')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-oc')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<ModelStatsRow model={mockModel} />);

    expect(screen.getByText('M: 6"')).toBeInTheDocument();
    expect(screen.getByText('T: 4')).toBeInTheDocument();
    expect(screen.getByText('Sv: 3+')).toBeInTheDocument();
    expect(screen.getByText('W: 5')).toBeInTheDocument();
    expect(screen.getByText('Ld: 6+')).toBeInTheDocument();
    expect(screen.getByText('OC: 1')).toBeInTheDocument();
  });

  it('displays model name', () => {
    render(<ModelStatsRow model={mockModel} />);

    expect(screen.getByText('Space Marine Captain')).toBeInTheDocument();
  });

  it('displays base size when available', () => {
    render(<ModelStatsRow model={mockModel} />);

    expect(screen.getByText('[40mm]')).toBeInTheDocument();
  });

  it('handles missing base size gracefully', () => {
    const modelWithoutBaseSize = { ...mockModel, baseSize: '' };
    render(<ModelStatsRow model={modelWithoutBaseSize} />);

    expect(screen.getByText('Space Marine Captain')).toBeInTheDocument();
    expect(screen.queryByText('[40mm]')).not.toBeInTheDocument();
  });
});
