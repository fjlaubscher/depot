import type { FC } from 'react';
import type { depot } from '@depot/core';

// components
import { Card } from '@/components/ui';

interface DatasheetCompositionProps {
  composition: depot.UnitComposition[];
  loadout: string;
  transport?: string;
  'data-testid'?: string;
}

export const DatasheetComposition: FC<DatasheetCompositionProps> = ({
  composition,
  loadout,
  transport,
  'data-testid': testId
}) => (
  <Card className="flex flex-col gap-2 p-4" data-testid={testId}>
    <ul className="space-y-2 list-disc pl-4">
      {composition.map((comp) => (
        <li
          key={`composition-${comp.line}`}
          className="text-sm text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: comp.description }}
        />
      ))}
    </ul>
    {loadout?.trim() ? (
      <p
        className="text-sm text-gray-700 dark:text-gray-300"
        dangerouslySetInnerHTML={{ __html: loadout }}
      />
    ) : null}
    {transport?.trim() ? (
      <p
        className="text-sm text-gray-700 dark:text-gray-300"
        dangerouslySetInnerHTML={{ __html: transport }}
        data-testid="transport-capacity"
      />
    ) : null}
  </Card>
);
