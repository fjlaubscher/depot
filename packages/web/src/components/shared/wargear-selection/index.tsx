import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { depot } from '@depot/core';
import WargearSection from './wargear-section';
import { separateWargearByType } from '@depot/core/utils/wargear';

interface WargearSelectionProps {
  wargear: depot.Wargear[];
  selectedWargear: depot.Wargear[];
  onSelectionChange: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearSelection: React.FC<WargearSelectionProps> = ({
  wargear,
  selectedWargear,
  onSelectionChange
}) => {
  const { t } = useTranslation('rosters');
  const { rangedWargear, meleeWargear, mixedWargear } = useMemo(() => {
    return separateWargearByType(wargear);
  }, [wargear]);

  if (wargear.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-wargear-available">
        <p className="text-subtle">{t('units.noWargear')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5" data-testid="wargear-table">
      <WargearSection
        wargear={rangedWargear}
        title={t('units.ranged')}
        dataTestId="ranged-wargear-section"
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={mixedWargear}
        title={t('units.mixed')}
        dataTestId="mixed-wargear-section"
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={meleeWargear}
        title={t('units.melee')}
        dataTestId="melee-wargear-section"
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

export default WargearSelection;
