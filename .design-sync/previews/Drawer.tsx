import { Drawer, Button, Card } from '@depot/web';

const noop = () => {};

export const OpenRight = () => (
  <Drawer isOpen position="right" onClose={noop} closeOnOverlayClick={false}>
    <div
      style={{
        height: '100%',
        background: 'var(--color-surface, #fff)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <Card.Title>Filter Datasheets</Card.Title>
      <Card.Description>Adeptus Astartes — 142 units</Card.Description>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <Button size="sm" variant="secondary">
          Battleline
        </Button>
        <Button size="sm" variant="secondary">
          Characters
        </Button>
        <Button size="sm" variant="secondary">
          Vehicles
        </Button>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <Button onClick={noop}>Apply filters</Button>
      </div>
    </div>
  </Drawer>
);

export const OpenLeft = () => (
  <Drawer isOpen position="left" onClose={noop} closeOnOverlayClick={false}>
    <div
      style={{
        height: '100%',
        background: 'var(--color-surface, #fff)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <Card.Title>Navigation</Card.Title>
      <Card.Description>Strike Force Cassius</Card.Description>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <Button size="sm" variant="ghost">
          Datasheets
        </Button>
        <Button size="sm" variant="ghost">
          Stratagems
        </Button>
        <Button size="sm" variant="ghost">
          Detachment
        </Button>
      </div>
    </div>
  </Drawer>
);
