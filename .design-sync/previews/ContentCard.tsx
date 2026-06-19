import { ContentCard, Button, StatCard, StatsRow } from '@depot/web';

export const Datasheet = () => (
  <div style={{ maxWidth: 360 }}>
    <ContentCard
      title="Terminator Squad"
      subtitle="Adeptus Astartes — Elites"
      badges={[
        { text: '185 pts', variant: 'primary' },
        { text: 'Infantry', variant: 'secondary' }
      ]}
    >
      <StatsRow title="Profile" subtitle="Terminator">
        <StatCard label="M" value={'5"'} />
        <StatCard label="T" value="5" />
        <StatCard label="SV" value="2+" />
        <StatCard label="W" value="3" />
        <StatCard label="LD" value="6+" />
        <StatCard label="OC" value="1" />
      </StatsRow>
    </ContentCard>
  </div>
);

export const WithActions = () => (
  <div style={{ maxWidth: 360 }}>
    <ContentCard
      title="Intercessor Squad"
      subtitle="Battleline"
      badges={[{ text: '200 pts', variant: 'primary' }]}
      actions={<Button size="sm">Add</Button>}
      legend="Bolt rifles and a wealth of tactical options make these the backbone of any strike force."
    />
  </div>
);

export const Expandable = () => (
  <div style={{ maxWidth: 360 }}>
    <ContentCard
      title="Redemptor Dreadnought"
      subtitle="Vehicle — Walker"
      badges={[{ text: '210 pts', variant: 'primary' }]}
      expandable
      defaultExpanded
    >
      <StatsRow title="Profile">
        <StatCard label="M" value={'8"'} />
        <StatCard label="T" value="10" />
        <StatCard label="SV" value="2+" />
        <StatCard label="W" value="12" />
        <StatCard label="LD" value="6+" />
        <StatCard label="OC" value="4" />
      </StatsRow>
    </ContentCard>
  </div>
);

export const Statuses = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
    <ContentCard
      title="Roboute Guilliman"
      subtitle="Epic Hero"
      badges={[
        { text: '340 pts', variant: 'primary' },
        { text: 'Character', variant: 'success' }
      ]}
    />
    <ContentCard
      title="Contemptor Dreadnought"
      subtitle="Legends"
      badges={[{ text: 'Legends', variant: 'danger' }]}
    />
  </div>
);
