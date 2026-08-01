import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';
import { calculateCollectionPoints } from '@depot/core/utils/collection';

import { Card, Tag } from '@/components/ui';

interface CollectionPreviewCardProps {
  collection: depot.Collection;
}

const CollectionPreviewCard: FC<CollectionPreviewCardProps> = ({ collection }) => {
  const points = calculateCollectionPoints(collection);
  const itemCount = collection.items.length;
  const itemLabel = itemCount === 1 ? 'unit' : 'units';

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group/link block h-full text-decoration-none"
      data-testid="collection-preview-card"
    >
      <Card interactive className="flex h-full flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Card.Title
              as="h3"
              className="truncate text-base transition-colors duration-200 group-hover/link:text-accent"
            >
              {collection.name}
            </Card.Title>
            <Card.Subtitle as="span" className="truncate text-xs capitalize">
              {collection.faction?.name || collection.factionSlug || collection.factionId}
            </Card.Subtitle>
          </div>
          <Tag variant="primary" size="sm" className="shrink-0 whitespace-nowrap">
            {points} pts
          </Tag>
        </div>
        <div className="mt-auto">
          <Tag size="sm" variant="default">
            {itemCount} {itemLabel}
          </Tag>
        </div>
      </Card>
    </Link>
  );
};

export default CollectionPreviewCard;
