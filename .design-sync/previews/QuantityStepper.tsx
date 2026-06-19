import { QuantityStepper } from '@depot/web';

export const Default = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span className="text-sm font-medium text-body">Intercessor Squad</span>
    <QuantityStepper value={5} onDecrease={() => {}} onIncrease={() => {}} min={5} max={10} />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <QuantityStepper size="sm" value={3} onDecrease={() => {}} onIncrease={() => {}} />
    <QuantityStepper size="md" value={3} onDecrease={() => {}} onIncrease={() => {}} />
  </div>
);

export const AtBounds = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <QuantityStepper value={1} min={1} max={6} onDecrease={() => {}} onIncrease={() => {}} />
    <QuantityStepper value={6} min={1} max={6} onDecrease={() => {}} onIncrease={() => {}} />
  </div>
);
