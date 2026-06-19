import { CollapsibleSection, Card } from '@depot/web';

export const Expanded = () => (
  <div style={{ maxWidth: 520 }}>
    <CollapsibleSection title="Detachment Rules" defaultExpanded>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Card.Title>Combat Doctrine</Card.Title>
        <Card.Description>
          While a unit from your army is within range of an objective marker you control, add 1 to
          the Objective Control characteristic of its models.
        </Card.Description>
      </div>
    </CollapsibleSection>
  </div>
);

export const Collapsed = () => (
  <div style={{ maxWidth: 520 }}>
    <CollapsibleSection title="Stratagems (6)">
      <Card.Description>Hidden until expanded.</Card.Description>
    </CollapsibleSection>
  </div>
);

export const Stacked = () => (
  <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <CollapsibleSection title="Wargear Options" defaultExpanded>
      <Card.Description>
        Any model may replace its bolt rifle with a bolt pistol and Astartes chainsword.
      </Card.Description>
    </CollapsibleSection>
    <CollapsibleSection title="Keywords">
      <Card.Description>Infantry, Battleline, Imperium, Adeptus Astartes.</Card.Description>
    </CollapsibleSection>
  </div>
);
