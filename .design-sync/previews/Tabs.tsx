import { Tabs, Card } from '@depot/web';

export const DatasheetTabs = () => (
  <div style={{ maxWidth: 520 }}>
    <Tabs tabs={['Datasheets', 'Stratagems', 'Detachment']} active={0}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Card.Title>Intercessor Squad</Card.Title>
        <Card.Description>
          Battleline infantry armed with bolt rifles. The dependable core of any Adeptus Astartes
          strike force.
        </Card.Description>
      </div>
      <div>Stratagem list goes here.</div>
      <div>Detachment rules go here.</div>
    </Tabs>
  </div>
);

export const SecondTabActive = () => (
  <div style={{ maxWidth: 520 }}>
    <Tabs tabs={['Datasheets', 'Stratagems', 'Detachment']} active={1}>
      <div>Datasheet list goes here.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Card.Title>Rapid Ingress</Card.Title>
        <Card.Description>
          1CP — End of your opponent's Movement phase: set up one Reserves unit on the battlefield.
        </Card.Description>
      </div>
      <div>Detachment rules go here.</div>
    </Tabs>
  </div>
);

export const ManyTabs = () => (
  <div style={{ maxWidth: 520 }}>
    <Tabs tabs={['Overview', 'Wargear', 'Abilities', 'Keywords']} active={2}>
      <div>Overview content.</div>
      <div>Wargear content.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Card.Title>Oath of Moment</Card.Title>
        <Card.Description>
          Select one enemy unit; re-roll Hit and Wound rolls against that unit until your next turn.
        </Card.Description>
      </div>
      <div>Keywords content.</div>
    </Tabs>
  </div>
);
