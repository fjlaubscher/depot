import type { depot } from '@depot/core';

import { Sheet, Tag } from '@/components/ui';
import { formatAbilityName } from '@depot/core/utils/abilities';
import { getAbilityTypeMeta } from '@/utils/abilities';

interface AbilitySheetProps {
  ability: depot.Ability | null;
  open: boolean;
  onClose: () => void;
}

/** Bottom sheet showing an ability's full rules text. */
const AbilitySheet: React.FC<AbilitySheetProps> = ({ ability, open, onClose }) => {
  if (!ability) return null;
  const meta = getAbilityTypeMeta(ability.type);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={formatAbilityName(ability)}
      subtitle={
        <Tag variant={meta.variant} size="sm" className="self-start cursor-default">
          {meta.label}
        </Tag>
      }
      data-testid="ability-sheet"
    >
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-body">
        {ability.legend ? (
          <div className="text-muted italic font-medium">{ability.legend}</div>
        ) : null}
        <div
          className="ability-rich-text"
          dangerouslySetInnerHTML={{ __html: ability.description ?? '' }}
        />
      </div>
    </Sheet>
  );
};

export default AbilitySheet;
