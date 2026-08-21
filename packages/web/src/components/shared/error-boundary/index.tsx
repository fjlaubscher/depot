import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';
import { Sentry } from '@/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppLayout title="Application Error">
          <ErrorState
            title="Application Error"
            message="Something went wrong with the application. Please refresh the page or try again later."
            stackTrace={this.state.error?.stack}
            showRetry
            showHome
            homeUrl="/"
            onRetry={() => this.setState({ hasError: false })}
          />
        </AppLayout>
      );
    }

    return this.props.children;
  }
}
