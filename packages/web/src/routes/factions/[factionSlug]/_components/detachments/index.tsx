import React, { useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import DetachmentCard from './detachment-card';

interface FactionDetachmentsProps {
  detachments: depot.Detachment[];
}

const FactionDetachments: React.FC<FactionDetachmentsProps> = ({ detachments }) => {
  const sortedDetachments = useMemo(
    () => [...detachments].sort((a, b) => a.name.localeCompare(b.name)),
    [detachments]
  );

  const [openDetachment, setOpenDetachment] = useState<string | null>(
    sortedDetachments.length > 0 ? sortedDetachments[0].slug : null
  );

  if (sortedDetachments.length === 0) {
    return (
      <div className="py-12 text-center text-subtle">
        No detachments available for this faction.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="faction-detachments">
      {sortedDetachments.map((detachment) => {
        const isOpen = openDetachment === detachment.slug;

        const handleToggle = () => {
          setOpenDetachment((current) => (current === detachment.slug ? null : detachment.slug));
        };

        return (
          <DetachmentCard
            key={detachment.slug}
            detachmentName={detachment.name}
            abilities={detachment.abilities}
            enhancements={detachment.enhancements}
            stratagems={detachment.stratagems}
            isOpen={isOpen}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
};

export default FactionDetachments;
