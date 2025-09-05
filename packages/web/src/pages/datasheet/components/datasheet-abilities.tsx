import React from 'react';
import { depot } from '@depot/core';

// components
import Card from '@/components/ui/card';
import Grid from '@/components/ui/grid';

interface DatasheetAbilitiesProps {
  abilities: depot.Ability[];
}

const DatasheetAbilities: React.FC<DatasheetAbilitiesProps> = ({ abilities }) => {
  if (abilities.length === 0) return null;

  return (
    <div data-testid="abilities">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Abilities</h4>
      <Grid>
        {abilities.map((ability) => (
          <Card key={ability.id} className="p-4 h-full">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{ability.name}</h5>
            <div
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: ability.description }}
            />
          </Card>
        ))}
      </Grid>
    </div>
  );
};

export default DatasheetAbilities;
