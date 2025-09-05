import React, { useMemo } from 'react';
import { depot } from '@depot/core';

import { StatCard } from '@/components/ui';
import WargearRow from '@/components/shared/wargear-row';
import { parseWargearKeywords } from '@/utils/wargear';

interface WargearStatsRowProps {
  wargear: depot.Wargear;
  type: depot.Wargear['type'];
}

const WargearStatsRow: React.FC<WargearStatsRowProps> = ({ wargear, type }) => {
  const keywords = useMemo(() => parseWargearKeywords(wargear.description), [wargear.description]);

  return (
    <WargearRow
      name={wargear.name}
      range={type === 'Ranged' ? wargear.range : undefined}
      keywords={keywords}
    >
      <StatCard label="A" value={wargear.a} />
      <StatCard
        label={type === 'Ranged' ? 'BS' : 'WS'}
        value={wargear.bsWs === 'N/A' ? wargear.bsWs : `${wargear.bsWs}+`}
      />
      <StatCard label="S" value={wargear.s} />
      <StatCard label="AP" value={wargear.ap} />
      <StatCard label="D" value={wargear.d} />
    </WargearRow>
  );
};

export default WargearStatsRow;
