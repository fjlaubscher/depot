import { StatCard } from '@depot/web';

export const Single = () => (
  <div style={{ maxWidth: 120 }}>
    <StatCard label="Toughness" value="4" />
  </div>
);

export const Profile = () => (
  <div style={{ display: 'flex', gap: 8 }}>
    <StatCard label="M" value={'6"'} />
    <StatCard label="T" value="4" />
    <StatCard label="SV" value="3+" />
    <StatCard label="W" value="2" />
    <StatCard label="LD" value="6+" />
    <StatCard label="OC" value="2" />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <StatCard label="Wounds" value="12" size="default" />
    <StatCard label="Wounds" value="12" size="compact" />
  </div>
);
