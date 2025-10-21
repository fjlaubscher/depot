import { describe, expect, it } from 'vitest';
import { buildSourceClassifier } from './source-classification.js';
import type { wahapedia } from '@depot/core';

const buildSource = (overrides: Partial<wahapedia.Source>): wahapedia.Source => ({
  id: 'source-id',
  name: 'Source Name',
  type: 'Faction Pack',
  edition: '10',
  version: '1.0',
  errataDate: '01.01.2025',
  errataLink: '',
  ...overrides
});

describe('buildSourceClassifier', () => {
  it('detects forge world faction packs', () => {
    const sources: wahapedia.Source[] = [
      buildSource({ id: 'fw', name: 'Space Marines (Forge World)' })
    ];

    const classify = buildSourceClassifier(sources);
    expect(classify('fw')).toEqual({
      isForgeWorld: true,
      isLegends: false
    });
  });

  it('detects legends sources from faction packs and legacy datasheets', () => {
    const sources: wahapedia.Source[] = [
      buildSource({ id: 'legends-pack', name: 'Space Marines (Warhammer Legends)' }),
      buildSource({
        id: 'legacy-datasheet',
        name: 'Legends: Ultramarines',
        type: 'Datasheet'
      })
    ];

    const classify = buildSourceClassifier(sources);
    expect(classify('legends-pack')).toEqual({
      isForgeWorld: false,
      isLegends: true
    });
    expect(classify('legacy-datasheet')).toEqual({
      isForgeWorld: false,
      isLegends: true
    });
  });

  it('returns false flags for unknown sources', () => {
    const sources: wahapedia.Source[] = [buildSource({ id: 'regular', name: 'Space Marines' })];

    const classify = buildSourceClassifier(sources);
    expect(classify('regular')).toEqual({
      isForgeWorld: false,
      isLegends: false
    });
    expect(classify(undefined)).toEqual({
      isForgeWorld: false,
      isLegends: false
    });
  });
});
