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
    <Card className="relative cursor-pointer" onClick={handleView} data-testid="roster-card">
      <div className="flex flex-col gap-3">
        {/* Title row - full width */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{roster.name}</h3>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-sm text-secondary">{roster.faction?.name}</span>
            {roster.detachment?.name && (
              <span className="text-xs text-subtle">{roster.detachment.name}</span>
            )}
          </div>
        </div>

        {/* Points and actions row */}
        <div className="flex justify-between items-center">
          <PointsTag points={roster.points.current} maxPoints={roster.points.max} />

          <ActionGroup
            actions={[
              {
                icon: <Pencil size={16} />,
                onClick: (e) => {
                  e.stopPropagation();
                  handleEdit();
                },
                ariaLabel: 'Edit roster',
                variant: 'primary'
              },
              {
                icon: <Trash2 size={16} />,
                onClick: (e) => {
                  e.stopPropagation();
                  handleDelete();
                },
                ariaLabel: 'Delete roster',
                variant: 'danger',
                disabled: isDeleting,
                'data-testid': 'delete-roster-button'
              }
            ]}
          />
        </div>
      </div>
    </Card>
  );
};
