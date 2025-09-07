import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestWrapper } from '@/test/test-utils';
import NotFound from './index';

// Mock hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the 404 error display', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByTestId('not-found-icon')).toBeInTheDocument();
    });

    it('displays the error message and description', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(/The page you're looking for has been moved, deleted, or doesn't exist/)
      ).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      expect(screen.getByTestId('go-home-button')).toBeInTheDocument();
      expect(screen.getByTestId('go-back-button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      const heading = screen.getByTestId('page-heading');
      expect(heading).toHaveTextContent('Page Not Found');
    });

    it('has accessible button labels', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      expect(screen.getByRole('button', { name: /Return to Home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('displays the search icon with proper test id', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      const icon = screen.getByTestId('not-found-icon');
      expect(icon).toBeInTheDocument();
    });

    it('displays the 404 text prominently', () => {
      render(<NotFound />, { wrapper: TestWrapper });

      const errorCode = screen.getByText('404');
      expect(errorCode).toBeInTheDocument();
    });
  });
});
