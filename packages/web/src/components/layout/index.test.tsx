import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Pencil } from 'lucide-react';

import { TestWrapper } from '@/test/test-utils';
import AppLayout from './index';

const media = vi.hoisted(() => ({ desktop: false }));

vi.mock('@/hooks/use-media-query', () => ({
  default: () => media.desktop
}));

vi.mock('@/components/layout/install-banner', () => ({
  default: () => null
}));

describe('AppLayout', () => {
  beforeEach(() => {
    media.desktop = false;
  });

  it('does not render a crumbs bar on Home', () => {
    render(
      <TestWrapper>
        <AppLayout title="depot - Offline Warhammer 40,000 Companion">
          <p>home</p>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.queryByTestId('desktop-top-bar')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Breadcrumb')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-back-button')).not.toBeInTheDocument();
  });

  it('puts heading and toolbar on one mobile row for root pages', () => {
    render(
      <TestWrapper>
        <AppLayout
          title="Collections"
          heading={{ title: 'Collections', subtitle: 'Owned models and paint state' }}
          crumbs={[{ label: 'Armies', to: '/armies' }, { label: 'Collections' }]}
          toolbar={<button data-testid="create-collection-button">New</button>}
        >
          <p>list</p>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByText('Owned models and paint state')).toBeInTheDocument();
    expect(screen.getByTestId('create-collection-button')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-top-bar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-back-button')).not.toBeInTheDocument();
  });

  it('keeps the mobile back header for nested pages and hides the tab bar', () => {
    render(
      <TestWrapper>
        <AppLayout
          title="Gladius Task Force - Detachment"
          back={{ to: '/factions', label: 'Factions' }}
          heading={{ title: 'Gladius Task Force', subtitle: 'Detachment' }}
          actions={[
            {
              icon: <Pencil size={16} />,
              onClick: () => undefined,
              ariaLabel: 'Edit'
            }
          ]}
        >
          <p>content</p>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.getByTestId('mobile-back-button')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toHaveTextContent('Gladius Task Force');
    expect(screen.getByTestId('page-header')).toHaveTextContent('Detachment');
    expect(screen.queryByTestId('desktop-top-bar')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders desktop breadcrumbs and toolbar instead of the back chevron', () => {
    media.desktop = true;

    render(
      <TestWrapper>
        <AppLayout
          title="My Marines - Collection Tracker"
          back={{ to: '/armies', label: 'Armies' }}
          crumbs={[
            { label: 'Armies', to: '/armies' },
            { label: 'Collections', to: '/collections' },
            { label: 'My Marines' }
          ]}
          heading={{ title: 'My Marines', subtitle: 'Adeptus Astartes - 1000 points' }}
          toolbar={<button data-testid="import-collection-button">Import</button>}
        >
          <p>detail</p>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.queryByTestId('mobile-back-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('desktop-top-bar')).toBeInTheDocument();
    const crumbs = screen.getByLabelText('Breadcrumb');
    expect(crumbs).toHaveTextContent('Armies');
    expect(crumbs).toHaveTextContent('Collections');
    expect(screen.getByTestId('page-header')).toHaveTextContent('My Marines');
    expect(screen.getByTestId('page-header')).toHaveTextContent('Adeptus Astartes');
    expect(within(crumbs).getByRole('link', { name: 'Armies' })).toHaveAttribute('href', '/armies');
    expect(screen.getByTestId('import-collection-button')).toBeInTheDocument();
  });
});
