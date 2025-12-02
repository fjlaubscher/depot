import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import { Trash2, Pencil, Copy } from 'lucide-react';
import { Card, ActionGroup, PointsTag, Tag } from '@/components/ui';

interface RosterCardProps {
  roster: depot.Roster;
  onDelete: (rosterId: string) => Promise<void>;
  onDuplicate: (roster: depot.Roster) => Promise<void>;
}

export const RosterCard: React.FC<RosterCardProps> = ({ roster, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleView = () => {
    navigate(`/rosters/${roster.id}`);
  };

  const handleEdit = () => {
    navigate(`/rosters/${roster.id}/details`);
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;

    setIsDuplicating(true);
    try {
      await onDuplicate(roster);
    } catch (error) {
      console.error('Failed to duplicate roster:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${roster.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        setIsDeleting(true);
        await onDelete(roster.id);
      } catch (error) {
        console.error('Failed to delete roster:', error);
        // The error handling is done in the parent component
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card
      interactive
      className="flex h-full cursor-pointer flex-col gap-4"
      onClick={handleView}
      data-testid="roster-card"
    >
      <Card.Header className="items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <Card.Title as="h3" className="truncate text-base font-semibold md:text-lg">
            {roster.name}
          </Card.Title>
          <Card.Subtitle as="span" className="truncate text-xs md:text-sm">
            {roster.faction?.name}
          </Card.Subtitle>
        </div>
        <PointsTag
          points={roster.points.current}
          maxPoints={roster.points.max}
          className="whitespace-nowrap"
        />
      </Card.Header>

      {roster.detachment?.name ? (
        <Card.Content className="flex flex-wrap items-center gap-2 text-xs text-subtle">
          <Tag size="sm" variant="secondary" className="uppercase tracking-wide">
            {roster.detachment.name}
          </Tag>
        </Card.Content>
      ) : null}

      <Card.Footer className="mt-auto flex w-full items-center gap-2">
        <div className="flex flex-1 items-center">
          <Tag size="sm" variant="default">
            {roster.units.length} {roster.units.length === 1 ? 'unit' : 'units'}
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
              ariaLabel: 'Duplicate roster',
              variant: 'secondary',
              disabled: isDuplicating,
              'data-testid': 'duplicate-roster-button'
            },
            {
              icon: <Pencil size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                handleEdit();
              },
              ariaLabel: 'Edit roster details',
              variant: 'primary'
            },
            {
              icon: <Trash2 size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                void handleDelete();
              },
              ariaLabel: 'Delete roster',
              variant: 'danger',
              disabled: isDeleting,
              'data-testid': 'delete-roster-button'
            }
          ]}
        />
      </Card.Footer>
    </Card>
  );
};
