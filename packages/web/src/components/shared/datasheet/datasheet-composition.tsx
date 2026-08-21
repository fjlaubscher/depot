import type { FC } from 'react';
import type { depot } from '@depot/core';

// components
import { Card } from '@/components/ui';

interface DatasheetCompositionProps {
  composition?: depot.UnitComposition[];
  loadout?: string;
  transport?: string;
  'data-testid'?: string;
}

export const DatasheetComposition: FC<DatasheetCompositionProps> = ({
  composition = [],
  loadout = '',
  transport = '',
  'data-testid': testId
}) => {
  const textClass = 'text-sm text-body';

  return (
    <Card className="flex flex-col gap-2 p-4" data-testid={testId}>
      {composition.length > 0 ? (
        <ul className="space-y-2 list-disc pl-4">
          {composition.map((comp) => (
            <li
              key={`composition-${comp.line}`}
              className={textClass}
              dangerouslySetInnerHTML={{ __html: comp.description }}
            />
          ))}
        </ul>
      ) : null}
      {loadout.trim() ? (
        <p className={textClass} dangerouslySetInnerHTML={{ __html: loadout }} />
      ) : null}
      {transport.trim() ? (
        <p
          className={textClass}
          dangerouslySetInnerHTML={{ __html: transport }}
          data-testid="transport-capacity"
        />
      ) : null}
    </Card>
  );
};
