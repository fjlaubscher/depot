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
  composition,
  loadout,
  transport,
  'data-testid': testId
}) => {
  const safeComposition = Array.isArray(composition) ? composition : [];
  const safeLoadout = typeof loadout === 'string' ? loadout : '';
  const safeTransport = typeof transport === 'string' ? transport : '';

  return (
    <Card className="flex flex-col gap-2 p-4" data-testid={testId}>
      {safeComposition.length > 0 ? (
        <ul className="space-y-2 list-disc pl-4">
          {safeComposition.map((comp) => (
            <li
              key={`composition-${comp.line}`}
              className="text-sm text-body"
              dangerouslySetInnerHTML={{ __html: comp.description }}
            />
          ))}
        </ul>
      ) : null}
      {safeLoadout.trim() ? (
        <p className="text-sm text-body" dangerouslySetInnerHTML={{ __html: safeLoadout }} />
      ) : null}
      {safeTransport.trim() ? (
        <p
          className="text-sm text-body"
          dangerouslySetInnerHTML={{ __html: safeTransport }}
          data-testid="transport-capacity"
        />
      ) : null}
    </Card>
  );
};
