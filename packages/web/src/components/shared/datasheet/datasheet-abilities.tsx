import type { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import { cx } from '@/utils/cx';

import { Tag, TagSection } from '@/components/ui';
import AbilitySheet from '@/components/shared/ability-sheet';
import { formatAbilityName, sortAbilitiesByType } from '@depot/core/utils/abilities';
import { getAbilityTypeMeta } from '@/utils/abilities';

interface DatasheetAbilitiesProps {
  title: string;
  abilities: depot.Ability[];
  dataTestId?: string;
  className?: string;
}

export const DatasheetAbilities: React.FC<DatasheetAbilitiesProps> = ({
  title,
  abilities,
  dataTestId,
  className
}) => {
  const [selectedAbility, setSelectedAbility] = useState<depot.Ability | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedAbilities = useMemo(() => sortAbilitiesByType(abilities), [abilities]);

  // Keep the ability mounted on close so the sheet content stays during the slide-out.
  const handleClose = useCallback(() => setIsModalOpen(false), []);

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>, ability: depot.Ability) => {
    event.stopPropagation();
    setSelectedAbility(ability);
    setIsModalOpen(true);
  }, []);

  const sectionTestId = dataTestId || `${title.toLowerCase().replace(/\s+/g, '-')}`;

  if (sortedAbilities.length === 0) {
    return null;
  }

  return (
    <>
      <TagSection
        title={title}
        description="Click a tag to view full rules."
        spacing="sm"
        className={className}
        data-testid={sectionTestId}
      >
        {sortedAbilities.map((ability) => {
          const { variant } = getAbilityTypeMeta(ability.type);
          const label = formatAbilityName(ability).toLowerCase();

          return (
            <button
              key={ability.id || ability.name}
              type="button"
              onClick={(event) => handleOpen(event, ability)}
              className={cx(
                'group inline-flex items-center rounded-full border border-transparent bg-white/80 px-0 py-0 text-left transition-all duration-150 dark:bg-gray-900/40 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900'
              )}
              data-testid={`${sectionTestId}-tag-${ability.id || ability.name}`}
            >
              <Tag variant={variant} size="sm" className="pointer-events-none capitalize">
                {label}
              </Tag>
            </button>
          );
        })}
      </TagSection>

      <AbilitySheet ability={selectedAbility} open={isModalOpen} onClose={handleClose} />
    </>
  );
};
