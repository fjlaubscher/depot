import { SkeletonCard } from '@depot/web';

export const Default = () => (
  <div style={{ width: 320 }}>
    <SkeletonCard />
  </div>
);

export const Grid = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: 320 }}>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);
