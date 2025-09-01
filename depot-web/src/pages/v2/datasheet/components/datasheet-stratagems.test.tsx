import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import DatasheetStratagems from './datasheet-stratagems';
import { mockStratagem, createMockStratagem } from '@/test/mock-data';

// Mock child components
vi.mock('@/components/shared/stratagem-card', () => ({
  default: ({ stratagem }: { stratagem: any }) => (
    <div data-testid="stratagem-card">{stratagem.name}</div>
  )
}));

// Mock debounce hook
vi.mock('@/hooks/use-debounce', () => ({
  default: (value: string) => value // Return immediately for testing
}));

// Mock utils
vi.mock('@/utils/array', () => ({
  sortByName: (items: any[]) => items.sort((a, b) => a.name.localeCompare(b.name))
}));

describe('DatasheetStratagems', () => {
  const multipleStratagems = [
    mockStratagem,
    createMockStratagem({
      id: 'honor-the-chapter',
      name: 'Honor the Chapter',
      type: 'Strategic Ploy',
      cpCost: '2'
    }),
    createMockStratagem({
      id: 'rapid-assault',
      name: 'Rapid Assault',
      type: 'Battle Tactic',
      cpCost: '1'
    })
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stratagems correctly', () => {
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    expect(screen.getByTestId('datasheet-stratagems')).toBeInTheDocument();
    expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
    expect(screen.getByText('Honor the Chapter')).toBeInTheDocument();
    expect(screen.getByText('Rapid Assault')).toBeInTheDocument();
  });

  it('renders search and filter controls', () => {
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    expect(screen.getByPlaceholderText('Search stratagems...')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
  });

  it('shows empty state when no stratagems provided', () => {
    render(<DatasheetStratagems stratagems={[]} />);

    expect(screen.getByTestId('no-stratagems')).toBeInTheDocument();
    expect(screen.getByText('No stratagems associated with this datasheet.')).toBeInTheDocument();
  });

  it('filters stratagems by search query', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    const searchInput = screen.getByPlaceholderText('Search stratagems...');
    await user.type(searchInput, 'honor');

    // Should show only "Honor the Chapter"
    expect(screen.getByText('Honor the Chapter')).toBeInTheDocument();
    expect(screen.queryByText('Rapid Fire')).not.toBeInTheDocument();
    expect(screen.queryByText('Rapid Assault')).not.toBeInTheDocument();
  });

  it('filters stratagems by type', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    const typeSelect = screen.getByLabelText('Filter by type');
    await user.selectOptions(typeSelect, 'Battle Tactic');

    // Should show only Battle Tactic stratagems
    expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
    expect(screen.getByText('Rapid Assault')).toBeInTheDocument();
    expect(screen.queryByText('Honor the Chapter')).not.toBeInTheDocument();
  });

  it('shows clear button when filters are active', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    // Initially no clear button
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();

    // Add search query
    const searchInput = screen.getByPlaceholderText('Search stratagems...');
    await user.type(searchInput, 'test');

    // Clear button should appear
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    // Set filters
    const searchInput = screen.getByPlaceholderText('Search stratagems...');
    const typeSelect = screen.getByLabelText('Filter by type');
    
    await user.type(searchInput, 'test');
    await user.selectOptions(typeSelect, 'Strategic Ploy');

    // Click clear
    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    // Filters should be cleared
    expect(searchInput).toHaveValue('');
    expect(typeSelect).toHaveValue('');
  });

  it('shows no results message when search yields no matches', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    const searchInput = screen.getByPlaceholderText('Search stratagems...');
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No stratagems found matching your search criteria.')).toBeInTheDocument();
  });

  it('generates correct type options from stratagems', () => {
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    const typeSelect = screen.getByLabelText('Filter by type');
    const options = Array.from(typeSelect.querySelectorAll('option'));
    
    expect(options).toHaveLength(3); // "All Types" + 2 unique types
    expect(options[0]).toHaveTextContent('All Types');
    expect(options.some(option => option.textContent === 'Battle Tactic')).toBe(true);
    expect(options.some(option => option.textContent === 'Strategic Ploy')).toBe(true);
  });

  it('handles case insensitive search', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    const searchInput = screen.getByPlaceholderText('Search stratagems...');
    await user.type(searchInput, 'HONOR'); // Uppercase

    expect(screen.getByText('Honor the Chapter')).toBeInTheDocument();
    expect(screen.queryByText('Rapid Fire')).not.toBeInTheDocument();
  });

  it('combines search and type filters correctly', async () => {
    const user = userEvent.setup();
    render(<DatasheetStratagems stratagems={multipleStratagems} />);

    // Filter by type first
    const typeSelect = screen.getByLabelText('Filter by type');
    await user.selectOptions(typeSelect, 'Battle Tactic');

    // Then search within that type
    const searchInput = screen.getByPlaceholderText('Search stratagems...');
    await user.type(searchInput, 'rapid fire');

    // Should show only "Rapid Fire" (matches type and search)
    expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
    expect(screen.queryByText('Rapid Assault')).not.toBeInTheDocument();
    expect(screen.queryByText('Honor the Chapter')).not.toBeInTheDocument();
  });
});