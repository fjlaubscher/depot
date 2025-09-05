import React from 'react';
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';

interface NotFoundStateProps {
  title: string;
  message: string;
  homeUrl?: string;
  testId?: string;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({ title, message, homeUrl = '/', testId }) => {
  return (
    <AppLayout title="Not Found">
      <ErrorState
        title={title}
        message={message}
        showRetry={false}
        homeUrl={homeUrl}
        data-testid={testId}
      />
    </AppLayout>
  );
};

export default NotFoundState;
