import { PageHeader, Card } from '@depot/web';
import { Plus, Share2, Trash2 } from 'lucide-react';

const noop = () => {};

export const WithActions = () => (
  <div style={{ maxWidth: 560 }}>
    <PageHeader
      title="Strike Force Cassius"
      subtitle="Adeptus Astartes — Gladius Task Force — 2000 pts"
      actions={[
        { icon: <Plus size={18} />, onClick: noop, ariaLabel: 'Add unit', variant: 'primary' },
        { icon: <Share2 size={18} />, onClick: noop, ariaLabel: 'Share', variant: 'secondary' },
        { icon: <Trash2 size={18} />, onClick: noop, ariaLabel: 'Delete', variant: 'danger' }
      ]}
    />
  </div>
);

export const TitleOnly = () => (
  <div style={{ maxWidth: 560 }}>
    <PageHeader title="Adeptus Astartes" subtitle="142 datasheets" />
  </div>
);

export const WithStats = () => (
  <div style={{ maxWidth: 560 }}>
    <PageHeader
      title="Intercessor Squad"
      subtitle="Battleline — Infantry"
      stats={
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Card.Badge variant="accent">80 pts</Card.Badge>
          <Card.Badge variant="info">M 6&quot;</Card.Badge>
          <Card.Badge variant="muted">T 4</Card.Badge>
          <Card.Badge variant="success">W 2</Card.Badge>
        </div>
      }
    />
  </div>
);

export const InlineActions = () => (
  <div style={{ maxWidth: 560 }}>
    <PageHeader
      title="My Rosters"
      alignActions="inline"
      actions={[
        { icon: <Plus size={18} />, onClick: noop, ariaLabel: 'New roster', variant: 'primary' }
      ]}
    />
  </div>
);
