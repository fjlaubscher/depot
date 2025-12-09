import { describe, expect, it } from 'vitest';
import type { Ability } from '../types/depot.js';
import { normalizeSelectedWargearAbilities } from './abilities.js';

const createAbility = (overrides: Partial<Ability> = {}): Ability => ({
  id: overrides.id ?? 'ab-1',
  name: overrides.name ?? 'Test Ability',
  description: overrides.description ?? 'Rules text',
  legend: overrides.legend ?? '',
  factionId: overrides.factionId ?? 'test',
  type: overrides.type ?? 'Datasheet',
  parameter: overrides.parameter
});

describe('ability normalization helpers', () => {
  it('deduplicates wargear abilities when ids or slugs overlap', () => {
    const wargearAbilities: Ability[] = [
      createAbility({ id: 'wa-1', name: 'Spectral Lash', type: 'Wargear', parameter: '(Aura)' }),
      createAbility({ id: 'wa-2', name: 'Photon Grenade', type: 'Wargear' })
    ];

    const selected: Ability[] = [
      { ...wargearAbilities[0] },
      { ...wargearAbilities[0], id: 'temporary-id' },
      { ...wargearAbilities[1], id: 'wa-2' },
      { ...wargearAbilities[1], id: '', name: 'Photon Grenade' }
    ];

    const normalized = normalizeSelectedWargearAbilities(selected, [
      ...wargearAbilities,
      createAbility({ id: 'core-ability', name: 'Objective Control', type: 'Core' })
    ]);

    expect(normalized).toHaveLength(2);
    expect(normalized[0].id).toBe('wa-1');
    expect(normalized[1].id).toBe('wa-2');
  });

  it('assigns deterministic ids when normalized abilities are missing identifiers', () => {
    const wargearAbilities: Ability[] = [
      createAbility({ id: 'wa-1', name: 'Arc Blade', type: 'Wargear' }),
      createAbility({ id: '', name: 'Shadow Field', type: 'Wargear', parameter: '(Aura)' })
    ];

    const selected: Ability[] = [
      { ...wargearAbilities[1] },
      { ...wargearAbilities[1], id: undefined }
    ];

    const normalized = normalizeSelectedWargearAbilities(selected, wargearAbilities);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].id).toBe('shadow-field-aura');
  });
});
