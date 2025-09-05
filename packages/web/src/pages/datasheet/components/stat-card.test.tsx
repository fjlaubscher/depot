import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './stat-card';

describe('StatCard', () => {
  it('renders label and value correctly', () => {
    render(<StatCard label="M" value='6"' />);

    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('6"')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<StatCard label="T" value="4" />);

    const statCard = container.firstChild as HTMLElement;
    expect(statCard).toHaveClass(
      'bg-gray-800',
      'text-white',
      'rounded',
      'px-3',
      'py-2',
      'text-center',
      'min-w-[60px]'
    );
  });

  it('uses tabular-nums for value display', () => {
    render(<StatCard label="Sv" value="3+" />);

    const valueElement = screen.getByText('3+');
    expect(valueElement).toHaveClass('tabular-nums');
  });

  it('renders different stat types correctly', () => {
    render(<StatCard label="OC" value="1" />);

    expect(screen.getByText('OC')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
