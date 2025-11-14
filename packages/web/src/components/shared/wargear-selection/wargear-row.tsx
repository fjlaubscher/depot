import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { Tag, TagGroup } from '@/components/ui';
import { parseWargearKeywords } from '@/utils/wargear';

interface WargearTableRowProps {
  weapon: depot.Wargear;
  showSelectionColumn: boolean;
  selectedWargear: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
}

const buildProfileLabel = (weapon: depot.Wargear, profile: depot.WargearProfile): string => {
  if (weapon.profiles.length === 1) {
    return weapon.name;
  }

  if (profile.profileName) {
    return profile.profileName;
  }

  if (profile.name && profile.name !== weapon.name) {
    return profile.name.replace(`${weapon.name} – `, '').trim();
  }

  return profile.type === 'Ranged' ? 'Ranged' : 'Melee';
};

const WargearRow = ({
  weapon,
  showSelectionColumn,
  selectedWargear,
  onSelectionChange
}: WargearTableRowProps) => {
  const isSelected = selectedWargear.some((selected) => selected.id === weapon.id);

  const handleToggle = useCallback(
    (event?: React.ChangeEvent<HTMLInputElement>) => {
      event?.stopPropagation();
      if (onSelectionChange) {
        onSelectionChange(weapon, !isSelected);
      }
    },
    [weapon, isSelected, onSelectionChange]
  );

  const handleCardClick = () => {
    if (showSelectionColumn && onSelectionChange) {
      onSelectionChange(weapon, !isSelected);
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/30 rounded hover:bg-gray-100/80 dark:hover:bg-gray-600/40 transition-colors ${
        showSelectionColumn ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {showSelectionColumn && (
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggle}
            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
            data-testid={`wargear-checkbox-${weapon.id}`}
          />
        </div>
      )}
      <div className="flex-grow flex flex-col gap-2">
        <div className="font-medium text-foreground">{weapon.name}</div>
        <div className="flex flex-col gap-2">
          {weapon.profiles.map((profile, index) => {
            const profileLabel = buildProfileLabel(weapon, profile);
            const keywords = parseWargearKeywords(profile.description);
            const isMelee = profile.type === 'Melee';
            const skillLabel = profile.type === 'Ranged' ? 'BS' : 'WS';

            return (
              <div
                key={`${weapon.id}-${profile.line ?? index}`}
                className="flex flex-col gap-2 rounded border border-gray-200/80 dark:border-gray-600/60 p-3 bg-white dark:bg-gray-800/60"
              >
                <div className="flex items-center justify-between text-xs text-subtle">
                  <span className="uppercase tracking-wide">{profileLabel}</span>
                  <span className="capitalize">{profile.type.toLowerCase()}</span>
                </div>
                <div className="grid grid-cols-6 gap-2 text-xs text-subtle">
                  <div className="text-center">
                    <div className="font-medium">Range</div>
                    <div>{isMelee ? '–' : profile.range ? `${profile.range}"` : '–'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">A</div>
                    <div>{profile.a || '–'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{skillLabel}</div>
                    <div>{profile.bsWs === 'N/A' ? profile.bsWs : `${profile.bsWs}+`}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">S</div>
                    <div>{profile.s || '–'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">AP</div>
                    <div>{profile.ap || '–'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">D</div>
                    <div>{profile.d || '–'}</div>
                  </div>
                </div>
                {keywords.length > 0 && (
                  <TagGroup spacing="sm">
                    {keywords.slice(0, 3).map((keyword, keywordIndex) => (
                      <Tag key={keywordIndex} variant="secondary" size="sm" className="capitalize">
                        {keyword}
                      </Tag>
                    ))}
                    {keywords.length > 3 && (
                      <Tag variant="secondary" size="sm">
                        +{keywords.length - 3}
                      </Tag>
                    )}
                  </TagGroup>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WargearRow;
