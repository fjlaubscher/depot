import { FieldSkeleton } from '@depot/web';

export const Default = () => (
  <div style={{ width: 320 }}>
    <FieldSkeleton />
  </div>
);

export const FormLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 320 }}>
    <FieldSkeleton />
    <FieldSkeleton />
    <FieldSkeleton />
  </div>
);
