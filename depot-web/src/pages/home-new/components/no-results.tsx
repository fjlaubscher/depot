import React from 'react';

interface NoResultsProps {
  query: string;
}

const NoResults: React.FC<NoResultsProps> = ({ query }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-400">
        No factions found matching "{query}"
      </p>
    </div>
  );
};

export default NoResults;