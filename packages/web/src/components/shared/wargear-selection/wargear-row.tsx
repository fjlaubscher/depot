import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { Tag, TagGroup } from '@/components/ui';
import { parseWargearKeywords } from '@/utils/wargear';

interface WargearTableRowProps {
  weapon: depot.Wargear;
  isRanged: boolean;
  showSelectionColumn: boolean;
  selectedWargear: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearRow = ({
  weapon,
  isRanged,
  showSelectionColumn,
  selectedWargear,
  onSelectionChange
}: WargearTableRowProps) => {
  const isSelected = selectedWargear.some(
    (selected) => selected.name === weapon.name && selected.line === weapon.line
  );

  const handleToggle = useCallback(() => {
    if (onSelectionChange) {
      onSelectionChange(weapon, !isSelected);
    }
  }, [weapon, isSelected, onSelectionChange]);

  const keywords = parseWargearKeywords(weapon.description);

  return {
    selected: showSelectionColumn ? (
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleToggle}
        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
        data-testid={`wargear-checkbox-${weapon.name.replace(/\s+/g, '-').toLowerCase()}`}
      />
    ) : undefined,
    name: <div className="font-medium text-foreground">{weapon.name}</div>,
    range: isRanged && weapon.range ? `${weapon.range}"` : '–',
    a: weapon.a || '–',
    skill: weapon.bsWs === 'N/A' ? weapon.bsWs : `${weapon.bsWs}+`,
    s: weapon.s || '–',
    ap: weapon.ap || '–',
    d: weapon.d || '–',
    keywords:
      keywords.length > 0 ? (
        <TagGroup spacing="sm">
          {keywords.slice(0, 3).map((keyword, index) => (
            <Tag key={index} variant="secondary" size="sm" className="capitalize">
              {keyword}
            </Tag>
          ))}
          {keywords.length > 3 && (
            <Tag variant="secondary" size="sm">
              +{keywords.length - 3}
            </Tag>
          )}
        </TagGroup>
      ) : null
  };
};

export default WargearRow;
