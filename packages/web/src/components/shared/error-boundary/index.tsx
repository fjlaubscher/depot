import { Component } from 'react';
import { useTranslation } from 'react-i18next';
import type { ErrorInfo, ReactNode } from 'react';
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';
import { Sentry } from '@/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const ErrorFallback = ({ error, onRetry }: { error?: Error; onRetry: () => void }) => {
  const { t } = useTranslation('common');
  return (
    <AppLayout title={t('error.applicationTitle')}>
      <ErrorState
        title={t('error.applicationTitle')}
        message={t('error.applicationMessage')}
        stackTrace={error?.stack}
        showRetry
        showHome
        homeUrl="/"
        onRetry={onRetry}
      />
    </AppLayout>
  );
};

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
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
