import { Skeleton } from '@depot/web';

export const Rectangular = () => (
  <div style={{ width: 320 }}>
    <Skeleton variant="rectangular" width="100%" height={48} />
  </div>
);

export const Rounded = () => (
  <div style={{ width: 320 }}>
    <Skeleton variant="rounded" width="100%" height={48} />
  </div>
);

export const Circular = () => <Skeleton variant="circular" width={64} height={64} />;

export const TextLines = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: 320 }}>
    <Skeleton variant="rounded" width="80%" height={16} />
    <Skeleton variant="rounded" width="100%" height={16} />
    <Skeleton variant="rounded" width="60%" height={16} />
  </div>
);

export const DatasheetRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: 320 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
      <Skeleton variant="rounded" width="70%" height={16} />
      <Skeleton variant="rounded" width="40%" height={12} />
    </div>
  </div>
);
