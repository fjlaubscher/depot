import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Pencil, Copy } from 'lucide-react';
import { Card, ActionGroup, Tag } from '@/components/ui';

interface LibraryCardProps {
  name: string;
  subtitle?: string;
  /** Points badge text, e.g. "120 / 2000 pts". */
  points: string;
  unitCount: number;
  /** Optional tag row rendered between header and footer. */
  tags?: ReactNode;
  viewPath: string;
  editPath: string;
  /** "roster" | "collection" — used for aria labels, confirm copy and test ids. */
  noun: string;
  onDelete: () => Promise<void>;
  onDuplicate: () => Promise<void>;
  'data-testid'?: string;
}

/** Grid card for the roster/collection libraries: name, faction, points, tags, unit count + actions. */
const LibraryCard: React.FC<LibraryCardProps> = ({
  name,
  subtitle,
  points,
  unitCount,
  tags,
  viewPath,
  editPath,
  noun,
  onDelete,
  onDuplicate,
  'data-testid': testId
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      await onDuplicate();
    } catch (error) {
      console.error(`Failed to duplicate ${noun}:`, error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`))
      return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error(`Failed to delete ${noun}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      interactive
      className="flex h-full cursor-pointer flex-col gap-4"
      onClick={() => navigate(viewPath)}
      data-testid={testId}
    >
      <Card.Header className="items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <Card.Title as="h3" className="truncate text-base font-semibold md:text-lg">
            {name}
          </Card.Title>
          <Card.Subtitle as="span" className="truncate text-xs capitalize md:text-sm">
            {subtitle}
          </Card.Subtitle>
        </div>
        <Tag variant="primary" size="sm" className="rounded-sm py-1 whitespace-nowrap">
          {points}
        </Tag>
      </Card.Header>

      {tags ? (
        <Card.Content className="flex flex-wrap items-center gap-2 text-xs text-subtle">
          {tags}
        </Card.Content>
      ) : null}

      <Card.Footer className="mt-auto flex w-full items-center gap-2">
        <div className="flex flex-1 items-center">
          <Tag size="sm" variant="default">
            {unitCount} {unitCount === 1 ? 'unit' : 'units'}
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
              ariaLabel: `Duplicate ${noun}`,
              variant: 'secondary',
              disabled: isDuplicating,
              'data-testid': `duplicate-${noun}-button`
            },
            {
              icon: <Pencil size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                navigate(editPath);
              },
              ariaLabel: noun === 'roster' ? 'Edit roster details' : `Edit ${noun}`,
              variant: 'primary'
            },
            {
              icon: <Trash2 size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                void handleDelete();
              },
              ariaLabel: `Delete ${noun}`,
              variant: 'danger',
              disabled: isDeleting,
              'data-testid': `delete-${noun}-button`
            }
          ]}
        />
      </Card.Footer>
    </Card>
  );
};

export default LibraryCard;
