type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface AbilityTypeMeta {
  label: string;
  variant: TagVariant;
}

const ABILITY_TYPE_META: Record<string, AbilityTypeMeta> = {
  Core: { label: 'Core', variant: 'primary' },
  Faction: { label: 'Faction', variant: 'secondary' },
  Datasheet: { label: 'Unit', variant: 'success' },
  Wargear: { label: 'Wargear', variant: 'warning' },
  Special: { label: 'Special', variant: 'danger' },
  'Special (правая колонка)': { label: 'Special', variant: 'danger' },
  Fortification: { label: 'Fortification', variant: 'warning' },
  'Fortification (левая колонка)': { label: 'Fortification', variant: 'warning' }
};

/**
 * Maps ability type to the display label and Tag variant used across the app.
 */
export const getAbilityTypeMeta = (type: string): AbilityTypeMeta =>
  ABILITY_TYPE_META[type] ?? { label: type, variant: 'default' };
