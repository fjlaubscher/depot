import { X } from 'lucide-react';
import type { depot } from '@depot/core';

import { Drawer, IconButton, Tag } from '@/components/ui';
import { formatAbilityName } from '@depot/core/utils/abilities';
import { getAbilityTypeMeta } from '@/utils/abilities';

interface AbilitySheetProps {
  ability: depot.Ability | null;
  open: boolean;
  onClose: () => void;
}

/** Bottom sheet showing an ability's full rules text. */
const AbilitySheet: React.FC<AbilitySheetProps> = ({ ability, open, onClose }) => {
  const meta = ability ? getAbilityTypeMeta(ability.type) : null;

  return (
    <Drawer
      isOpen={open && !!ability}
      onClose={onClose}
      position="bottom"
      data-testid="ability-sheet"
    >
      {ability && meta ? (
        <div
          className="flex min-h-0 flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ability-sheet-title"
        >
          <div className="flex items-start justify-between gap-4 border-b border-subtle p-4">
            <div className="flex flex-col gap-2">
              <h2 id="ability-sheet-title" className="text-lg font-semibold text-foreground">
                {formatAbilityName(ability)}
              </h2>
              <Tag variant={meta.variant} size="sm" className="self-start cursor-default">
                {meta.label}
              </Tag>
            </div>
            <IconButton
              aria-label="Close ability details"
              variant="ghost"
              onClick={onClose}
              data-testid="ability-sheet-close"
            >
              <X size={18} />
            </IconButton>
          </div>
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4 text-sm leading-relaxed text-body">
            {ability.legend ? (
              <div className="text-muted italic font-medium">{ability.legend}</div>
            ) : null}
            <div
              className="ability-rich-text"
              dangerouslySetInnerHTML={{ __html: ability.description }}
            />
          </div>
        </div>
      ) : null}
    </Drawer>
  );
};

export default AbilitySheet;
