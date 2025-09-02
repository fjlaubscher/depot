import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Stat from './index';

describe('Stat Component', () => {
  it('renders value correctly', () => {
    render(<Stat value="Space Marines" />);

    expect(screen.getByText('Space Marines')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <Stat title="Faction" value="Space Marines" description="The Emperor's finest warriors" />
    );

    expect(screen.getByText('Faction')).toBeInTheDocument();
    expect(screen.getByText('Space Marines')).toBeInTheDocument();
    expect(screen.getByText("The Emperor's finest warriors")).toBeInTheDocument();
  });

  it('applies default variant styling', () => {
    render(<Stat title="Alliance" value="Imperium" />);

    const title = screen.getByText('Alliance');
    const value = screen.getByText('Imperium');

    expect(title).toHaveClass('text-xs');
    expect(value).toHaveClass('text-lg');
  });

  it('applies large variant styling', () => {
    render(<Stat title="Alliance" value="Imperium" variant="large" />);

    const title = screen.getByText('Alliance');
    const value = screen.getByText('Imperium');

    expect(title).toHaveClass('text-sm');
    expect(value).toHaveClass('text-2xl');
  });

  it('applies custom className', () => {
    render(<Stat value="Test" className="custom-class" />);

    const stat = screen.getByText('Test').parentElement;
    expect(stat).toHaveClass('custom-class');
  });

  it('renders without title or description', () => {
    render(<Stat value="Only Value" />);

    expect(screen.getByText('Only Value')).toBeInTheDocument();
    expect(screen.queryByText('FACTION')).not.toBeInTheDocument();
  });

  it('has proper dark mode classes', () => {
    render(<Stat title="Title" value="Value" description="Description" />);

    const title = screen.getByText('Title');
    const value = screen.getByText('Value');
    const description = screen.getByText('Description');

    expect(title).toHaveClass('dark:text-gray-300');
    expect(value).toHaveClass('dark:text-white');
    expect(description).toHaveClass('dark:text-gray-400');
  });
});
