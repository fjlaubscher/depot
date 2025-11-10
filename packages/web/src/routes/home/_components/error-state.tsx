import React from 'react';
import Layout from '@/components/ui/layout';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Layout title="Home">
      <div className="text-center py-12">
        <p className="text-danger">Error loading factions: {error}</p>
      </div>
    </Layout>
  );
};

export default ErrorState;
