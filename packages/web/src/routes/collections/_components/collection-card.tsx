import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import { Trash2, Pencil, Copy } from 'lucide-react';

import { Card, ActionGroup, PointsTag, Tag } from '@/components/ui';
import {
  COLLECTION_STATE_META,
  COLLECTION_UNIT_STATES,
  calculateCollectionPoints
} from '@/utils/collection';

interface CollectionCardProps {
  collection: depot.Collection;
  onDelete: (collectionId: string) => Promise<void>;
  onDuplicate: (collection: depot.Collection) => Promise<void>;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleView = () => {
    navigate(`/collections/${collection.id}`);
  };

  const handleEdit = () => {
    navigate(`/collections/${collection.id}`);
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      await onDuplicate(collection);
    } catch (error) {
      console.error('Failed to duplicate collection:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(collection.id);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const points = calculateCollectionPoints(collection);

  const stateSummary = collection.items.reduce<Record<depot.CollectionUnitState, number>>(
    (acc, item) => {
      acc[item.state] = (acc[item.state] ?? 0) + 1;
      return acc;
    },
    {
      sprue: 0,
      built: 0,
      'battle-ready': 0,
      'parade-ready': 0
    }
  );

  return (
    <Card
      interactive
      className="flex h-full cursor-pointer flex-col gap-4"
      onClick={handleView}
      data-testid={`collection-card-${collection.id}`}
    >
      <Card.Header className="items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Card.Title as="h3" className="truncate text-base font-semibold sm:text-lg">
            {collection.name}
          </Card.Title>
          <Card.Subtitle as="span" className="truncate text-sm capitalize">
            {collection.faction?.name || collection.factionSlug || collection.factionId}
          </Card.Subtitle>
        </div>
        <PointsTag points={points} className="whitespace-nowrap" />
      </Card.Header>

      {Object.entries(stateSummary).length > 0 ? (
        <Card.Content separated className="flex flex-wrap items-center gap-2 text-xs text-subtle">
          <div className="flex flex-wrap items-center gap-1">
            {COLLECTION_UNIT_STATES.map((state) => {
              const count = stateSummary[state];
              if (!count) return null;
              const meta = COLLECTION_STATE_META[state];
              return (
                <Tag key={state} size="sm" variant={meta.variant}>
                  {meta.label}: {count}
                </Tag>
              );
            })}
          </div>
        </Card.Content>
      ) : null}

      <Card.Footer
        separated={false}
        className="mt-auto flex w-full items-center gap-3 border-t border-subtle pt-3"
      >
        <div className="flex flex-1 items-center">
          <Tag size="sm" variant="default">
            {collection.items.length} {collection.items.length === 1 ? 'unit' : 'units'}
          </Tag>
        </div>
        <ActionGroup
          spacing="tight"
          actions={[
            {
              icon: <Copy size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                void handleDuplicate();
              },
              ariaLabel: 'Duplicate collection',
              variant: 'secondary',
              disabled: isDuplicating
            },
            {
              icon: <Pencil size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                handleEdit();
              },
              ariaLabel: 'Edit collection',
              variant: 'primary'
            },
            {
              icon: <Trash2 size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                void handleDelete();
              },
              ariaLabel: 'Delete collection',
              variant: 'danger',
              disabled: isDeleting
            }
          ]}
        />
      </Card.Footer>
    </Card>
  );
};

export default CollectionCard;
