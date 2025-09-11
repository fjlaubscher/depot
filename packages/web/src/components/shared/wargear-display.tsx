import React, { useMemo } from 'react';
import { depot } from '@depot/core';
import { CollapsibleSection, StatCard } from '@/components/ui';
import WargearRow from './wargear-row';
import { parseWargearKeywords } from '@/utils/wargear';

interface WargearDisplayProps {
  wargear: depot.Wargear[];
  title?: string;
  showTypeHeaders?: boolean;
  showCollapsibleWrapper?: boolean;
  className?: string;
  itemClassName?: string;
}

const WargearDisplay: React.FC<WargearDisplayProps> = ({
  wargear,
  title = 'Wargear',
  showTypeHeaders = true,
  showCollapsibleWrapper = true,
  className,
  itemClassName
}) => {
  const { rangedWargear, meleeWargear } = useMemo(() => {
    const ranged: depot.Wargear[] = [];
    const melee: depot.Wargear[] = [];

    wargear.forEach((weapon) => {
      if (weapon.type === 'Ranged') {
        ranged.push(weapon);
      } else if (weapon.type === 'Melee') {
        melee.push(weapon);
      }
    });

    return { rangedWargear: ranged, meleeWargear: melee };
  }, [wargear]);

  if (wargear.length === 0) {
    return null;
  }

  const renderWargearItem = (wargearItem: depot.Wargear) => {
    const keywords = parseWargearKeywords(wargearItem.description);

    return (
      <div key={wargearItem.name} className={itemClassName}>
        <WargearRow
          name={wargearItem.name}
          range={wargearItem.type === 'Ranged' ? wargearItem.range : undefined}
          keywords={keywords}
        >
          <StatCard label="A" value={wargearItem.a} />
          <StatCard
            label={wargearItem.type === 'Ranged' ? 'BS' : 'WS'}
            value={wargearItem.bsWs === 'N/A' ? wargearItem.bsWs : `${wargearItem.bsWs}+`}
          />
          <StatCard label="S" value={wargearItem.s} />
          <StatCard label="AP" value={wargearItem.ap} />
          <StatCard label="D" value={wargearItem.d} />
        </WargearRow>
      </div>
    );
  };

  const renderContent = () => {
    // If we're not showing type headers, just render all wargear in order
    if (!showTypeHeaders) {
      return <div className="flex flex-col gap-4">{wargear.map(renderWargearItem)}</div>;
    }

    // Show with type headers (Ranged/Melee sections)
    return (
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Ranged Weapons */}
        {rangedWargear.length > 0 && (
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black mb-3">
              Ranged Wargear
            </h4>
            <div className="flex flex-col gap-4">{rangedWargear.map(renderWargearItem)}</div>
          </div>
        )}

        {/* Melee Weapons */}
        {meleeWargear.length > 0 && (
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black mb-3">
              Melee Wargear
            </h4>
            <div className="flex flex-col gap-4">{meleeWargear.map(renderWargearItem)}</div>
          </div>
        )}
      </div>
    );
  };

  // Wrap in collapsible section if requested
  if (showCollapsibleWrapper) {
    return (
      <CollapsibleSection title={title} defaultExpanded={false} className={className}>
        {renderContent()}
      </CollapsibleSection>
    );
  }

  // Return content directly with className applied to wrapper
  return <div className={className}>{renderContent()}</div>;
};

export default WargearDisplay;
