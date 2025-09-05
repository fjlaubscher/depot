import React from 'react';
import AppLayout from '@/components/layout';
import { ErrorState } from '@/components/ui';

interface DatasheetErrorStateProps {
  error: string;
}

const DatasheetErrorState: React.FC<DatasheetErrorStateProps> = ({ error }) => {
  return (
    <AppLayout title="Error">
      <ErrorState
        title="Failed to Load Datasheet"
        message="We encountered an error while trying to load this datasheet. This could be due to network issues or the datasheet may not exist."
        stackTrace={error}
      />
    </AppLayout>
  );
};

export default DatasheetErrorState;
