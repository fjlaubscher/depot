import { Tag, TagGroup, TagSection } from '@depot/web';

export const Variants = () => (
  <TagGroup>
    <Tag variant="default">Infantry</Tag>
    <Tag variant="primary">Character</Tag>
    <Tag variant="secondary">Battleline</Tag>
    <Tag variant="success">Deep Strike</Tag>
    <Tag variant="warning">Epic Hero</Tag>
    <Tag variant="danger">Legends</Tag>
  </TagGroup>
);

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Tag variant="primary" size="sm">
      Small
    </Tag>
    <Tag variant="primary" size="md">
      Medium
    </Tag>
    <Tag variant="primary" size="lg">
      Large
    </Tag>
  </div>
);

export const Keywords = () => (
  <div style={{ maxWidth: 360 }}>
    <TagGroup spacing="sm">
      <Tag variant="default" size="sm">
        Imperium
      </Tag>
      <Tag variant="default" size="sm">
        Adeptus Astartes
      </Tag>
      <Tag variant="default" size="sm">
        Tacticus
      </Tag>
      <Tag variant="default" size="sm">
        Grenades
      </Tag>
      <Tag variant="default" size="sm">
        Smoke
      </Tag>
    </TagGroup>
  </div>
);

export const Section = () => (
  <div style={{ maxWidth: 360 }}>
    <TagSection title="Faction Keywords" description="Shared across the detachment">
      <Tag variant="primary" size="sm">
        Ultramarines
      </Tag>
      <Tag variant="secondary" size="sm">
        Gladius Task Force
      </Tag>
      <Tag variant="default" size="sm">
        Oath of Moment
      </Tag>
    </TagSection>
  </div>
);
