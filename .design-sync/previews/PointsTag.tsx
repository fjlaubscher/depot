import { PointsTag } from '@depot/web';

export const Single = () => <PointsTag points={185} />;

export const RosterTotal = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <PointsTag points={1985} maxPoints={2000} />
  </div>
);

export const UnitList = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 360 }}>
    <PointsTag points={95} />
    <PointsTag points={185} />
    <PointsTag points={200} />
    <PointsTag points={210} />
    <PointsTag points={340} />
  </div>
);
