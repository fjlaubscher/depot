import { PageHeaderSkeleton } from '@depot/web';

export const Default = () => (
  <div style={{ width: 360 }}>
    <PageHeaderSkeleton />
  </div>
);

export const InPageLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 360 }}>
    <PageHeaderSkeleton />
    <PageHeaderSkeleton />
  </div>
);
