import { IconButton } from '@depot/web';
import { Plus, Trash2, Pencil, Share2, Search } from 'lucide-react';

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <IconButton variant="default" aria-label="Add unit">
      <Plus size={18} />
    </IconButton>
    <IconButton variant="ghost" aria-label="Search datasheets">
      <Search size={18} />
    </IconButton>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <IconButton size="sm" aria-label="Edit roster">
      <Pencil size={14} />
    </IconButton>
    <IconButton size="md" aria-label="Edit roster">
      <Pencil size={18} />
    </IconButton>
    <IconButton size="lg" aria-label="Edit roster">
      <Pencil size={22} />
    </IconButton>
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <IconButton aria-label="Share roster">
      <Share2 size={18} />
    </IconButton>
    <IconButton disabled aria-label="Remove unit">
      <Trash2 size={18} />
    </IconButton>
    <IconButton loading aria-label="Saving roster">
      <Plus size={18} />
    </IconButton>
  </div>
);
