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

  it('renders ancestor crumbs and the real heading in the desktop bar', () => {
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
    expect(within(crumbs).getByRole('link', { name: 'Armies' })).toHaveAttribute('href', '/armies');
    expect(within(crumbs).getByRole('link', { name: 'Collections' })).toHaveAttribute(
      'href',
      '/collections'
    );
    expect(within(crumbs).queryByText('My Marines')).not.toBeInTheDocument();
    const header = screen.getByTestId('page-header');
    expect(within(header).getByRole('heading', { name: 'My Marines' })).toBeInTheDocument();
    expect(header).toHaveTextContent('Adeptus Astartes');
    expect(screen.getByTestId('import-collection-button')).toBeInTheDocument();
  });

  it('uses only the parent as a desktop breadcrumb when given back and heading', () => {
    media.desktop = true;

    render(
      <TestWrapper>
        <AppLayout
          title="Intercessor Squad - Space Marines"
          back={{ to: '/faction/space-marines', label: 'Space Marines' }}
          heading={{ title: 'Intercessor Squad', subtitle: 'Datasheet' }}
        >
          <p>datasheet</p>
        </AppLayout>
      </TestWrapper>
    );

    const crumbs = screen.getByLabelText('Breadcrumb');
    expect(within(crumbs).getByRole('link', { name: 'Space Marines' })).toHaveAttribute(
      'href',
      '/faction/space-marines'
    );
    expect(within(crumbs).queryByText('Intercessor Squad')).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('page-header')).getByRole('heading', { name: 'Intercessor Squad' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toHaveTextContent('Datasheet');
    expect(screen.queryByTestId('mobile-back-button')).not.toBeInTheDocument();
  });

  it('renders explicit Rules and Faction crumbs above the datasheet heading', () => {
    media.desktop = true;

    render(
      <TestWrapper>
        <AppLayout
          title="Intercessor Squad - Space Marines"
          back={{ to: '/faction/space-marines', label: 'Space Marines' }}
          crumbs={[
            { label: 'Rules', to: '/factions' },
            { label: 'Space Marines', to: '/faction/space-marines' }
          ]}
          heading={{ title: 'Intercessor Squad', subtitle: 'Datasheet' }}
        >
          <p>datasheet</p>
        </AppLayout>
      </TestWrapper>
    );

    const crumbs = screen.getByLabelText('Breadcrumb');
    expect(within(crumbs).getByRole('link', { name: 'Rules' })).toHaveAttribute(
      'href',
      '/factions'
    );
    expect(within(crumbs).getByRole('link', { name: 'Space Marines' })).toHaveAttribute(
      'href',
      '/faction/space-marines'
    );
    expect(within(crumbs).queryByText('Intercessor Squad')).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('page-header')).getByRole('heading', { name: 'Intercessor Squad' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toHaveTextContent('Datasheet');
  });

  it('does not render a desktop bar for title-only pages', () => {
    media.desktop = true;

    render(
      <TestWrapper>
        <AppLayout title="Settings">
          <h1>Settings</h1>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.queryByTestId('desktop-top-bar')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Breadcrumb')).not.toBeInTheDocument();
  });

  it('renders heading.meta inside the desktop page header, not main', () => {
    media.desktop = true;

    render(
      <TestWrapper>
        <AppLayout
          title="Invasion Fleet"
          heading={{ title: 'Invasion Fleet', meta: <span data-testid="heading-meta">3 DP</span> }}
        >
          <p>abilities</p>
        </AppLayout>
      </TestWrapper>
    );

    const bar = screen.getByTestId('desktop-top-bar');
    const header = within(bar).getByTestId('page-header');
    expect(within(header).getByTestId('heading-meta')).toHaveTextContent('3 DP');
    expect(within(screen.getByRole('main')).queryByTestId('heading-meta')).not.toBeInTheDocument();
  });

  it('keeps Rules active on faction and datasheet pages', () => {
    media.desktop = true;

    render(
      <TestWrapper initialEntries={['/faction/astra-militarum/datasheet/yarrick']}>
        <AppLayout
          title="Yarrick - Astra Militarum"
          back={{ to: '/faction/astra-militarum', label: 'Astra Militarum' }}
          heading={{ title: 'Yarrick', subtitle: 'Datasheet' }}
        >
          <p>datasheet</p>
        </AppLayout>
      </TestWrapper>
    );

    const rules = screen.getByRole('link', { name: 'Rules' });
    expect(rules).toHaveClass('border-border-accent');
    expect(rules).toHaveClass('text-accent');
    const armies = screen.getByRole('link', { name: 'Armies' });
    expect(armies).not.toHaveClass('border-border-accent');
    expect(armies).not.toHaveClass('text-accent');
  });
});
