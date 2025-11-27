import { describe, it, expect } from 'vitest';
import type { depot, wahapedia } from '@depot/core';
import { buildDetachmentSupplementIndex } from './generate-data.js';

describe('buildDetachmentSupplementIndex', () => {
  const datasheets: Array<
    Pick<depot.Datasheet, 'id' | 'supplementKey' | 'supplementSlug' | 'supplementName'>
  > = [
    { id: 'codex-sheet', supplementKey: 'codex', supplementSlug: 'codex', supplementName: 'Codex' },
    {
      id: 'ba-sheet',
      supplementKey: 'blood-angels',
      supplementSlug: 'blood-angels',
      supplementName: 'Blood Angels'
    },
    {
      id: 'dw-sheet',
      supplementKey: 'deathwatch',
      supplementSlug: 'deathwatch',
      supplementName: 'Deathwatch'
    }
  ];

  const detachmentAbilities: wahapedia.DetachmentAbility[] = [
    {
      id: 'gladius-core',
      factionId: 'SM',
      name: 'Doctrine Core',
      legend: '',
      description: '',
      detachment: 'Gladius Task Force'
    },
    {
      id: 'gladius-ba',
      factionId: 'SM',
      name: 'Doctrine BA',
      legend: '',
      description: '',
      detachment: 'Gladius Task Force'
    },
    {
      id: 'spectrus',
      factionId: 'SM',
      name: 'Spectrus',
      legend: '',
      description: '',
      detachment: 'Spectrus Kill Team'
    }
  ];

  const datasheetDetachmentAbilities: wahapedia.DatasheetDetachmentAbility[] = [
    { datasheetId: 'codex-sheet', detachmentAbilityId: 'gladius-core' },
    { datasheetId: 'ba-sheet', detachmentAbilityId: 'gladius-ba' },
    { datasheetId: 'dw-sheet', detachmentAbilityId: 'spectrus' }
  ];

  it('derives supplement keys from datasheets referencing detachment abilities', () => {
    const result = buildDetachmentSupplementIndex(
      datasheets,
      datasheetDetachmentAbilities,
      detachmentAbilities
    );

    expect(result.get('Gladius Task Force')).toEqual({
      supplementKey: 'blood-angels',
      supplementLabel: 'Blood Angels'
    });

    expect(result.get('Spectrus Kill Team')).toEqual({
      supplementKey: 'deathwatch',
      supplementLabel: 'Deathwatch'
    });
  });

  it('falls back to codex when no supplement datasheets are linked', () => {
    const codexOnly = buildDetachmentSupplementIndex(
      [datasheets[0]],
      [{ datasheetId: 'codex-sheet', detachmentAbilityId: 'gladius-core' }],
      [detachmentAbilities[0]]
    );

    expect(codexOnly.get('Gladius Task Force')).toEqual({
      supplementKey: 'codex',
      supplementLabel: 'None'
    });
  });
});
