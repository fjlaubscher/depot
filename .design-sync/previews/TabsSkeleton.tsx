import { TabsSkeleton } from '@depot/web';

export const Default = () => (
  <div style={{ width: 360 }}>
    <TabsSkeleton />
  </div>
);

export const FourTabs = () => (
  <div style={{ width: 360 }}>
    <TabsSkeleton tabCount={4} />
  </div>
);
