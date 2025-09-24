import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters from './search-filters';

describe('SearchFilters', () => {
  const defaultProps = {
    query: '',
    onQueryChange: vi.fn(),
    onClear: vi.fn()
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with correct label', () => {
    render(<SearchFilters {...defaultProps} />);

    expect(screen.getByLabelText('Search by name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display the current query value', () => {
    render(<SearchFilters {...defaultProps} query="space marines" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('space marines');
  });

  it('should not show clear button when query is empty', () => {
    render(<SearchFilters {...defaultProps} query="" />);

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('should show clear button when query has value', () => {
    render(<SearchFilters {...defaultProps} query="test query" />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('should call onQueryChange when user types in search input', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'chaos');

    expect(defaultProps.onQueryChange).toHaveBeenCalled();
    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('s'); // Last character typed
  });

  it('should call onQueryChange when user clears input manually', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} query="existing" />);

    const input = screen.getByRole('textbox');
    await user.clear(input);

    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('');
  });

  it('should call onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} query="test query" />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid typing correctly', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const input = screen.getByRole('textbox');

    // Type rapidly
    await user.type(input, 'test');

    expect(defaultProps.onQueryChange).toHaveBeenCalledTimes(4);
    expect(defaultProps.onQueryChange).toHaveBeenNthCalledWith(1, 't');
    expect(defaultProps.onQueryChange).toHaveBeenNthCalledWith(2, 'e');
    expect(defaultProps.onQueryChange).toHaveBeenNthCalledWith(3, 's');
    expect(defaultProps.onQueryChange).toHaveBeenNthCalledWith(4, 't');
  });

  it('should handle special characters in search query', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, "T'au Empire");

    expect(defaultProps.onQueryChange).toHaveBeenCalled();
    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('e'); // Last character typed
  });
});
