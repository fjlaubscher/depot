import React, { useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import DetachmentCard from './detachment-card';

interface DetachmentGroup {
  abilities: depot.DetachmentAbility[];
  enhancements: depot.Enhancement[];
  stratagems: depot.Stratagem[];
}

interface NewFactionDetachmentsProps {
  detachments: Record<string, DetachmentGroup>;
}

const NewFactionDetachments: React.FC<NewFactionDetachmentsProps> = ({ detachments }) => {
  const detachmentEntries = useMemo(
    () => Object.entries(detachments).sort(([a], [b]) => a.localeCompare(b)),
    [detachments]
  );

  const [openDetachment, setOpenDetachment] = useState<string | null>(
    detachmentEntries.length > 0 ? detachmentEntries[0][0] : null
  );

  if (detachmentEntries.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No detachments available for this faction.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="faction-detachments-new">
      {detachmentEntries.map(([name, data]) => {
        const isOpen = openDetachment === name;

        const handleToggle = () => {
          setOpenDetachment((current) => (current === name ? null : name));
        };

        return (
          <DetachmentCard
            key={name}
            detachmentName={name}
            abilities={data.abilities}
            enhancements={data.enhancements}
            stratagems={data.stratagems}
            isOpen={isOpen}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
};

export default NewFactionDetachments;
