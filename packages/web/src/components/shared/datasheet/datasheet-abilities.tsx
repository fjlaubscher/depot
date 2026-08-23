import { useMemo } from 'react';
import type { depot } from '@depot/core';

import { Tag, TagSection } from '@/components/ui';
import { formatAbilityName, sortAbilitiesByType } from '@depot/core/utils/abilities';
import { getAbilityTypeMeta } from '@/utils/abilities';

interface DatasheetAbilitiesProps {
  title: string;
  abilities: depot.Ability[];
  dataTestId?: string;
  className?: string;
}

/** Ability names only — the rules text lives on Wahapedia. */
export const DatasheetAbilities: React.FC<DatasheetAbilitiesProps> = ({
  title,
  abilities,
  dataTestId,
  className
}) => {
  const sortedAbilities = useMemo(() => sortAbilitiesByType(abilities), [abilities]);
  const sectionTestId = dataTestId || `${title.toLowerCase().replace(/\s+/g, '-')}`;

  if (sortedAbilities.length === 0) {
    return null;
  }

  return (
    <TagSection title={title} spacing="sm" className={className} data-testid={sectionTestId}>
      {sortedAbilities.map((ability) => (
        <Tag
          key={ability.id || ability.name}
          variant={getAbilityTypeMeta(ability.type).variant}
          size="sm"
          className="capitalize cursor-default"
          data-testid={`${sectionTestId}-tag-${ability.id || ability.name}`}
        >
          {formatAbilityName(ability).toLowerCase()}
        </Tag>
      ))}
    </TagSection>
  );
};
