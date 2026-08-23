import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import InstallBanner from './install-banner';

const mockPwa = vi.hoisted(() => ({
  hasPrompt: true,
  standalone: false,
  bannerDismissed: false,
  busy: false
}));

vi.mock('@/hooks/use-pwa-install', () => ({
  usePwaInstall: () => mockPwa,
  promptInstall: vi.fn(),
  dismissInstallBanner: vi.fn()
}));

describe('InstallBanner', () => {
  beforeEach(() => {
    mockPwa.hasPrompt = true;
    mockPwa.standalone = false;
    mockPwa.bannerDismissed = false;
    mockPwa.busy = false;
  });

  it('shows the one-time install copy when Chrome has a deferred prompt', () => {
    render(<InstallBanner />);
    expect(screen.getByTestId('install-banner')).toBeInTheDocument();
    expect(screen.getByText('Install depot for offline use.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('hides after dismiss, when standalone, or when there is no prompt', () => {
    mockPwa.bannerDismissed = true;
    const dismissed = render(<InstallBanner />);
    expect(dismissed.queryByTestId('install-banner')).not.toBeInTheDocument();
    dismissed.unmount();

    mockPwa.bannerDismissed = false;
    mockPwa.standalone = true;
    const standalone = render(<InstallBanner />);
    expect(standalone.queryByTestId('install-banner')).not.toBeInTheDocument();
    standalone.unmount();

    mockPwa.standalone = false;
    mockPwa.hasPrompt = false;
    render(<InstallBanner />);
    expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();
  });
});
