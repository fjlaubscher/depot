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
            onRetry={() => this.setState({ hasError: false })}
          />
        </AppLayout>
      );
    }

    return this.props.children;
  }
}
