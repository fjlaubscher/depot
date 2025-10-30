import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import { Trash2, Pencil } from 'lucide-react';
import { Card, ActionGroup, PointsTag } from '@/components/ui';

interface RosterCardProps {
  roster: depot.Roster;
  onDelete: (rosterId: string) => Promise<void>;
}

export const RosterCard: React.FC<RosterCardProps> = ({ roster, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    navigate(`/rosters/${roster.id}`);
  };

  const handleEdit = () => {
    navigate(`/rosters/${roster.id}/edit`);
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
    <Card interactive className="cursor-pointer" onClick={handleView} data-testid="roster-card">
      <Card.Header className="items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Card.Title as="h3" className="truncate text-base font-semibold sm:text-lg">
            {roster.name}
          </Card.Title>
          <div className="flex flex-col gap-1">
            <Card.Subtitle as="span" className="truncate text-sm">
              {roster.faction?.name}
            </Card.Subtitle>
            {roster.detachment?.name ? (
              <Card.Description as="span" className="text-xs">
                {roster.detachment.name}
              </Card.Description>
            ) : null}
          </div>
        </div>
        <PointsTag
          points={roster.points.current}
          maxPoints={roster.points.max}
          className="whitespace-nowrap"
        />
      </Card.Header>

      <Card.Footer align="end">
        <ActionGroup
          actions={[
            {
              icon: <Pencil size={16} />,
              onClick: (event) => {
                event.stopPropagation();
                handleEdit();
              },
              ariaLabel: 'Edit roster',
              variant: 'primary'
            },
            {
              icon: <Trash2 size={16} />,
              onClick: (event) => {
                event.stopPropagation();
                handleDelete();
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
