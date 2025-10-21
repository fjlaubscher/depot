import type { wahapedia } from '@depot/core';

const LEGENDS_PREFIX = 'Legends:';
const LEGENDS_SUFFIX = '(Warhammer Legends)';
const FORGE_WORLD_SUFFIX = '(Forge World)';

export interface SourceClassification {
  isForgeWorld: boolean;
  isLegends: boolean;
}

export type SourceClassifier = (sourceId: string | undefined) => SourceClassification;

/**
 * Builds a classifier capable of deriving Forge World / Legends flags for a given source ID.
 * The logic reflects current Wahapedia exports:
 * - Faction packs that end with "(Forge World)" should be surfaced as Forge World.
 * - Faction packs that end with "(Warhammer Legends)" should be surfaced as Legends.
 * - Legacy datasheet sources that start with "Legends:" should continue to be marked as Legends.
 */
export const buildSourceClassifier = (sources: wahapedia.Source[]): SourceClassifier => {
  const forgeWorldIds = new Set<string>();
  const legendsIds = new Set<string>();

  sources.forEach((source) => {
    const name = source.name.trim();

    if (name.endsWith(FORGE_WORLD_SUFFIX)) {
      forgeWorldIds.add(source.id);
    }

    if (name.endsWith(LEGENDS_SUFFIX) || name.startsWith(LEGENDS_PREFIX)) {
      legendsIds.add(source.id);
    }
  });

  return (sourceId) => {
    if (!sourceId) {
      return { isForgeWorld: false, isLegends: false };
    }

    return {
      isForgeWorld: forgeWorldIds.has(sourceId),
      isLegends: legendsIds.has(sourceId)
    };
  };
};
