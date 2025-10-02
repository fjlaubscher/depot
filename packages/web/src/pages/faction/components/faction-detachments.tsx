import React, { useMemo } from 'react';
import type { depot } from '@depot/core';

// Utils
import { groupFactionDataByDetachment } from '@/utils/faction';

// Components
import NewFactionDetachments from './new-detachments';

interface FactionDetachmentsProps {
  detachmentAbilities: depot.DetachmentAbility[];
  enhancements: depot.Enhancement[];
  stratagems: depot.Stratagem[];
}

const FactionDetachments: React.FC<FactionDetachmentsProps> = ({
  detachmentAbilities,
  enhancements,
  stratagems
}) => {
  const detachmentsByName = useMemo(() => {
    return groupFactionDataByDetachment(detachmentAbilities, enhancements, stratagems);
  }, [detachmentAbilities, enhancements, stratagems]);

  return <NewFactionDetachments detachments={detachmentsByName} />;
};

export default FactionDetachments;
