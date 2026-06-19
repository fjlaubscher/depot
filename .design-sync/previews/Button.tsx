import { Button } from '@depot/web';

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="default">Add to Roster</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="accent">View Datasheet</Button>
    <Button variant="error">Remove Unit</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button>Enabled</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Saving</Button>
    <Button variant="secondary" fullWidth>
      Full width
    </Button>
  </div>
);
