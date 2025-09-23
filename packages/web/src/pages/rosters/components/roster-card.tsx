import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { depot } from '@depot/core';
import { Trash2, Eye } from 'lucide-react';
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

  const handleCardClick = () => {
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
    <Card className="relative cursor-pointer" onClick={handleCardClick} data-testid="roster-card">
      <div className="flex flex-col gap-3">
        {/* Title row - full width */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {roster.name}
          </h3>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">{roster.faction?.name}</span>
            {roster.detachment?.name && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {roster.detachment.name}
              </span>
            )}
          </div>
        </div>

        {/* Points and actions row */}
        <div className="flex justify-between items-center">
          <PointsTag points={roster.points.current} maxPoints={roster.points.max} />

          <ActionGroup
            actions={[
              {
                icon: <Eye size={16} />,
                onClick: (e) => {
                  e.stopPropagation();
                  handleView();
                },
                ariaLabel: 'View roster',
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
