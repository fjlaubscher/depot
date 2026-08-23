import type { Detachment, DetachmentAbility, Enhancement, Stratagem } from '../types/depot.js';
import type * as wahapedia from '../types/wahapedia.js';
import { sortByName } from './common.js';

export const toDepotEnhancement = (enhancement: wahapedia.Enhancement): Enhancement => ({
  id: enhancement.id,
  factionId: enhancement.factionId,
  name: enhancement.name,
  cost: enhancement.cost,
  detachment: enhancement.detachment,
  ...(enhancement.upgrade === 'true' ? { upgrade: true } : {})
});

/** Rules text stays on Wahapedia; depot ships names and numbers only. */
export const toDepotStratagem = (stratagem: wahapedia.Stratagem): Stratagem => ({
  id: stratagem.id,
  factionId: stratagem.factionId,
  name: stratagem.name,
  type: stratagem.type,
  cpCost: stratagem.cpCost,
  turn: stratagem.turn,
  phase: stratagem.phase,
  detachment: stratagem.detachment
});

export const toDepotDetachmentAbility = (
  ability: wahapedia.DetachmentAbility
): DetachmentAbility => ({
  id: ability.id,
  factionId: ability.factionId,
  name: ability.name,
  detachment: ability.detachment
});

const shortIdSuffix = (id: string): string => id.replace(/^0+/, '').slice(-4) || id.slice(-4);

export interface BuildFactionDetachmentsInput {
  factionId: string;
  detachments: wahapedia.Detachment[];
  chapterDp: wahapedia.DetachmentChapterDp[];
  abilities: wahapedia.DetachmentAbility[];
  enhancements: wahapedia.Enhancement[];
  stratagems: wahapedia.Stratagem[];
  createSlug: (value: string) => string;
}

export const buildFactionDetachments = ({
  factionId,
  detachments,
  chapterDp,
  abilities,
  enhancements,
  stratagems,
  createSlug
}: BuildFactionDetachmentsInput): Detachment[] => {
  const factionRows = detachments.filter((row) => row.factionId === factionId);
  const seenNames = new Set<string>();

  const built = factionRows.map((row) => {
    const slugSource = seenNames.has(row.name) ? `${row.name}-${shortIdSuffix(row.id)}` : row.name;
    seenNames.add(row.name);

    return {
      id: row.id,
      slug: createSlug(slugSource),
      name: row.name,
      type: row.type ?? '',
      dp: row.dp ?? '',
      forceDisposition: row.forceDisposition ?? '',
      chapterDp: chapterDp
        .filter((entry) => entry.detachmentId === row.id)
        .map((entry) => ({ keyword: entry.keyword, dp: entry.dp })),
      abilities: sortByName(
        abilities.filter((ability) => ability.detachmentId === row.id).map(toDepotDetachmentAbility)
      ),
      enhancements: sortByName(
        enhancements
          .filter((enhancement) => enhancement.detachmentId === row.id)
          .map(toDepotEnhancement)
      ),
      stratagems: sortByName(
        stratagems.filter((stratagem) => stratagem.detachmentId === row.id).map(toDepotStratagem)
      )
    };
  });

  return sortByName(built);
};

export const formatChapterDpLine = (chapterDp: { keyword: string; dp: string }[]): string =>
  chapterDp.map((entry) => `${entry.keyword} ${entry.dp} DP`).join(', ');

export const matchDetachment = (
  current: { id?: string; slug?: string; name?: string } | undefined,
  candidates: Detachment[]
): Detachment | undefined =>
  current &&
  ((current.id && candidates.find((entry) => entry.id === current.id)) ||
    (current.slug && candidates.find((entry) => entry.slug === current.slug)) ||
    (current.name && candidates.find((entry) => entry.name === current.name)) ||
    undefined);
