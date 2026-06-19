import { ActionGroup } from '@depot/web';
import { Plus, Pencil, Share2, Trash2, Star } from 'lucide-react';

const noop = () => {};

export const RosterActions = () => (
  <ActionGroup
    actions={[
      { icon: <Plus size={18} />, onClick: noop, ariaLabel: 'Add unit', variant: 'primary' },
      { icon: <Pencil size={18} />, onClick: noop, ariaLabel: 'Edit roster', variant: 'default' },
      { icon: <Share2 size={18} />, onClick: noop, ariaLabel: 'Share roster', variant: 'secondary' },
      { icon: <Trash2 size={18} />, onClick: noop, ariaLabel: 'Delete roster', variant: 'danger' }
    ]}
  />
);

export const Variants = () => (
  <ActionGroup
    actions={[
      { icon: <Star size={18} />, onClick: noop, ariaLabel: 'Favourite', variant: 'primary' },
      { icon: <Star size={18} />, onClick: noop, ariaLabel: 'Favourite', variant: 'secondary' },
      { icon: <Star size={18} />, onClick: noop, ariaLabel: 'Favourite', variant: 'danger' },
      { icon: <Star size={18} />, onClick: noop, ariaLabel: 'Favourite', variant: 'default' },
      { icon: <Star size={18} />, onClick: noop, ariaLabel: 'Favourite', variant: 'ghost' }
    ]}
  />
);

export const Spacing = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <ActionGroup
      spacing="tight"
      actions={[
        { icon: <Plus size={18} />, onClick: noop, ariaLabel: 'Add', variant: 'primary' },
        { icon: <Pencil size={18} />, onClick: noop, ariaLabel: 'Edit', variant: 'default' },
        { icon: <Trash2 size={18} />, onClick: noop, ariaLabel: 'Delete', variant: 'danger' }
      ]}
    />
    <ActionGroup
      spacing="normal"
      actions={[
        { icon: <Plus size={18} />, onClick: noop, ariaLabel: 'Add', variant: 'primary' },
        { icon: <Pencil size={18} />, onClick: noop, ariaLabel: 'Edit', variant: 'default' },
        { icon: <Trash2 size={18} />, onClick: noop, ariaLabel: 'Delete', variant: 'danger' }
      ]}
    />
    <ActionGroup
      spacing="loose"
      actions={[
        { icon: <Plus size={18} />, onClick: noop, ariaLabel: 'Add', variant: 'primary' },
        { icon: <Pencil size={18} />, onClick: noop, ariaLabel: 'Edit', variant: 'default' },
        { icon: <Trash2 size={18} />, onClick: noop, ariaLabel: 'Delete', variant: 'danger' }
      ]}
    />
  </div>
);
