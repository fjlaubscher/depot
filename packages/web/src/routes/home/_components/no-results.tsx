import React from 'react';

interface NoResultsProps {
  query: string;
}

const NoResults: React.FC<NoResultsProps> = ({ query }) => {
  return (
    <div className="text-center py-8">
      <p className="text-subtle">No factions found matching "{query}"</p>
    </div>
  );
};

export default NoResults;
