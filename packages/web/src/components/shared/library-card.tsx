import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from '@/lib/navigation';
import { Trash2, Pencil, Copy } from 'lucide-react';
import { Card, ActionGroup } from '@/components/ui';

interface LibraryCardProps {
  name: string;
  /** Mono meta line under the name, e.g. `ASTRA MILITARUM · 34 UNITS`. */
  meta: string;
  /** Points readout, right aligned. */
  points: ReactNode;
  /** Caption under the points, e.g. `PTS` or `/2000`. */
  pointsCaption?: string;
  /** Optional block between header and actions — tag row, progress bar. */
  content?: ReactNode;
  viewPath: string;
  editPath: string;
  /** "roster" | "collection" — used for aria labels, confirm copy and test ids. */
  noun: string;
  onDelete: () => Promise<void>;
  onDuplicate: () => Promise<void>;
  'data-testid'?: string;
}

/** Row card for the roster/collection libraries: name, meta, points + actions. */
const LibraryCard: React.FC<LibraryCardProps> = ({
  name,
  meta,
  points,
  pointsCaption,
  content,
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
      padding="sm"
      className="flex h-full cursor-pointer flex-col gap-2"
      onClick={() => navigate(viewPath)}
      data-testid={testId}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-[14.5px] leading-tight font-bold text-foreground">{name}</h3>
          <span className="truncate font-mono text-[9.5px] font-medium uppercase text-muted">
            {meta}
          </span>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-[15px] leading-none font-bold text-foreground">
            {points}
          </div>
          {pointsCaption ? (
            <div className="mt-0.5 font-mono text-[8.5px] font-medium text-subtle">
              {pointsCaption}
            </div>
          ) : null}
        </div>
      </div>

      {content}

      <div className="mt-auto flex justify-end">
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
      </div>
    </Card>
  );
};

export default LibraryCard;
