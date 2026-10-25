import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@/lib/navigation';
import type { depot } from '@depot/core';

import { ModelStatsRow } from '@/components/shared';
import DatasheetHero from '@/components/shared/datasheet/datasheet-hero';
import { DatasheetAbilities } from '@/components/shared/datasheet';
import { categorizeAbilities } from '@depot/core/utils/abilities';
import WargearTable from '@/components/shared/wargear-table';

interface RosterUnitProfilePanelProps {
  unit: depot.RosterUnit;
  abilitiesTestId?: string;
  showViewDatasheetLink?: boolean;
}

/** Expanded unit details (stats, composition, abilities, selected wargear) in the muted panel treatment. */
const RosterUnitProfilePanel: FC<RosterUnitProfilePanelProps> = ({
  unit,
  abilitiesTestId = 'roster-unit-abilities',
  showViewDatasheetLink = false
}) => {
  const { t } = useTranslation('catalog');
  const datasheet = unit.datasheet;
  const { inline, referenced } = categorizeAbilities([
    ...datasheet.abilities.filter((ability) => (ability.type ?? '').toLowerCase() !== 'wargear'),
    ...(unit.selectedWargearAbilities ?? [])
  ]);
  const selectedWargear = unit.selectedWargear ?? [];

  return (
    <div className="bg-surface-muted p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2" data-testid="roster-unit-profile">
          {datasheet.models.map((model) => (
            <ModelStatsRow key={model.line} model={model} />
          ))}

          <DatasheetHero datasheet={datasheet} showPoints={false} />

          <DatasheetAbilities
            title={t('abilities')}
            abilities={[...referenced, ...inline]}
            dataTestId={abilitiesTestId}
          />

          {selectedWargear.length > 0 && (
            <div className="flex flex-col gap-2" data-testid="roster-unit-selected-wargear">
              <WargearTable wargear={selectedWargear} title={t('selectedWargear')} type="Mixed" />
            </div>
          )}
        </div>

        {showViewDatasheetLink ? (
          <div>
            <Link
              to={`/faction/${unit.datasheet.factionSlug}/datasheet/${
                unit.datasheetSlug ?? unit.datasheet.slug
              }`}
              className="inline-flex items-center text-sm text-accent transition-colors hover:text-accent-500"
            >
              {t('viewFullDatasheet')}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RosterUnitProfilePanel;
