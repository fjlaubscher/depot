import { ToggleSwitch } from '@depot/web';

export const States = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
    <ToggleSwitch label="Show Legends units" enabled onChange={() => {}} />
    <ToggleSwitch label="Forge World units" enabled={false} onChange={() => {}} />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
    <ToggleSwitch size="sm" label="Group by role" enabled onChange={() => {}} />
    <ToggleSwitch size="md" label="Hide unavailable" enabled onChange={() => {}} />
    <ToggleSwitch size="lg" label="Dark mode" enabled onChange={() => {}} />
  </div>
);
