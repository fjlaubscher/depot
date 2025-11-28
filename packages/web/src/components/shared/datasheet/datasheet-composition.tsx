import type { FC } from 'react';
import type { depot } from '@depot/core';

// components
import { Card } from '@/components/ui';

interface DatasheetCompositionProps {
  composition?: depot.UnitComposition[];
  loadout?: string;
  transport?: string;
  'data-testid'?: string;
  variant?: 'default' | 'compact';
}

export const DatasheetComposition: FC<DatasheetCompositionProps> = ({
  composition,
  loadout,
  transport,
  'data-testid': testId,
  variant = 'default'
}) => {
  const safeComposition = Array.isArray(composition) ? composition : [];
  const safeLoadout = typeof loadout === 'string' ? loadout : '';
  const safeTransport = typeof transport === 'string' ? transport : '';
  const textClass = variant === 'compact' ? 'text-sm text-body' : 'text-sm md:text-base text-body';

  return (
    <Card className="flex flex-col gap-2 p-4" data-testid={testId}>
      {safeComposition.length > 0 ? (
        <ul className="space-y-2 list-disc pl-4">
          {safeComposition.map((comp) => (
            <li
              key={`composition-${comp.line}`}
              className={textClass}
              dangerouslySetInnerHTML={{ __html: comp.description }}
            />
          ))}
        </ul>
      ) : null}
      {safeLoadout.trim() ? (
        <p className={textClass} dangerouslySetInnerHTML={{ __html: safeLoadout }} />
      ) : null}
      {safeTransport.trim() ? (
        <p
          className={textClass}
          dangerouslySetInnerHTML={{ __html: safeTransport }}
          data-testid="transport-capacity"
        />
      ) : null}
    </Card>
  );
};
