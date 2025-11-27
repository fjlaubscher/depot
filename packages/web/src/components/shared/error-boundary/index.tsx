import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';
import { Sentry } from '@/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showRetry?: boolean;
  homeUrl?: string;
  /**
   * How the boundary should recover when Retry is pressed.
   * - 'reload': full window reload (useful for root boundary to reset storage/providers)
   * - 'remount': reset internal error state and re-render children
   */
  resetStrategy?: 'reload' | 'remount';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack
        }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      const handleRetry = () => {
        if (this.props.resetStrategy === 'reload') {
          if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
            window.location.reload();
          }
          return;
        }

        this.setState({ hasError: false });
      };

      return (
        <AppLayout title="Application Error">
          <ErrorState
            title={this.props.fallbackTitle || 'Something went wrong'}
            message={
              this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'
            }
            stackTrace={this.state.error?.stack}
            showRetry={this.props.showRetry}
            showHome={!!this.props.homeUrl}
            homeUrl={this.props.homeUrl}
            onRetry={handleRetry}
          />
        </AppLayout>
      );
    }

    return this.props.children;
  }
}
