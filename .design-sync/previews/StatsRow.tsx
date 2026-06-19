import { StatsRow, StatCard } from '@depot/web';

export const UnitProfile = () => (
  <div style={{ maxWidth: 360 }}>
    <StatsRow title="Intercessor" subtitle="Battleline">
      <StatCard label="M" value={'6"'} />
      <StatCard label="T" value="4" />
      <StatCard label="SV" value="3+" />
      <StatCard label="W" value="2" />
      <StatCard label="LD" value="6+" />
      <StatCard label="OC" value="2" />
    </StatsRow>
  </div>
);

export const Compact = () => (
  <div style={{ maxWidth: 360 }}>
    <StatsRow title="Aggressor" subtitle="Infantry" variant="compact">
      <StatCard label="M" value={'5"'} size="compact" />
      <StatCard label="T" value="6" size="compact" />
      <StatCard label="SV" value="3+" size="compact" />
      <StatCard label="W" value="4" size="compact" />
      <StatCard label="LD" value="6+" size="compact" />
      <StatCard label="OC" value="2" size="compact" />
    </StatsRow>
  </div>
);

export const Stacked = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
    <StatsRow title="Captain" subtitle="Character">
      <StatCard label="M" value={'6"'} />
      <StatCard label="T" value="4" />
      <StatCard label="SV" value="2+" />
      <StatCard label="W" value="5" />
      <StatCard label="LD" value="6+" />
      <StatCard label="OC" value="1" />
    </StatsRow>
    <StatsRow title="Redemptor Dreadnought" subtitle="Vehicle">
      <StatCard label="M" value={'8"'} />
      <StatCard label="T" value="10" />
      <StatCard label="SV" value="2+" />
      <StatCard label="W" value="12" />
      <StatCard label="LD" value="6+" />
      <StatCard label="OC" value="4" />
    </StatsRow>
  </div>
);
