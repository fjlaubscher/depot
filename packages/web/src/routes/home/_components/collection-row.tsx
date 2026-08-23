import type { FC } from 'react';
import { Link } from '@/lib/navigation';
import type { depot } from '@depot/core';

import { calculateCollectionPoints } from '@depot/core/utils/collection';
import { getReadyPercent } from '@/utils/collection';

const CollectionRow: FC<{ collection: depot.Collection }> = ({ collection }) => {
  const ready = getReadyPercent(collection.items);

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="surface-card flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:border-border-accent"
      data-testid="collection-preview-card"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] leading-tight font-bold text-foreground">
          {collection.name}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-xs bg-surface-soft">
          <div className="h-full bg-success-fg" style={{ width: `${ready}%` }} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono text-[13px] leading-none font-bold text-success-fg">{ready}%</div>
        <div className="mt-0.5 font-mono text-[9px] font-medium text-subtle">
          READY · {calculateCollectionPoints(collection)} PTS
        </div>
      </div>
    </Link>
  );
};

export default CollectionRow;
