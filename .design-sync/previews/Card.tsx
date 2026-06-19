import { Card, Button } from '@depot/web';

export const Composed = () => (
  <Card style={{ maxWidth: 360 }}>
    <Card.Header>
      <div>
        <Card.Title>Terminator Squad</Card.Title>
        <Card.Subtitle>Adeptus Astartes — Elites</Card.Subtitle>
      </div>
      <Card.BadgeGroup>
        <Card.Badge variant="accent">185 pts</Card.Badge>
      </Card.BadgeGroup>
    </Card.Header>
    <Card.Content>
      Five Terminators clad in tactical Dreadnought armour, each armed with a storm bolter and
      power fist. A resilient anvil for any strike force.
    </Card.Content>
    <Card.Footer align="end">
      <Button size="sm" variant="secondary">
        Datasheet
      </Button>
      <Button size="sm">Add</Button>
    </Card.Footer>
  </Card>
);

export const Badges = () => (
  <Card style={{ maxWidth: 360 }}>
    <Card.Header>
      <Card.Title>Badge variants</Card.Title>
    </Card.Header>
    <Card.Content>
      <Card.BadgeGroup>
        <Card.Badge variant="accent">Character</Card.Badge>
        <Card.Badge variant="muted">Battleline</Card.Badge>
        <Card.Badge variant="info">Infantry</Card.Badge>
        <Card.Badge variant="success">Deep Strike</Card.Badge>
        <Card.Badge variant="warning">Epic Hero</Card.Badge>
        <Card.Badge variant="danger">Legends</Card.Badge>
      </Card.BadgeGroup>
    </Card.Content>
  </Card>
);

export const Variants = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Card variant="default" style={{ width: 220 }}>
      <Card.Title>Default</Card.Title>
      <Card.Description>Subtle shadow, filled surface.</Card.Description>
    </Card>
    <Card variant="outlined" style={{ width: 220 }}>
      <Card.Title>Outlined</Card.Title>
      <Card.Description>Bordered, no shadow.</Card.Description>
    </Card>
  </div>
);
