import type { Detachment, Enhancement } from '../types/depot.js';
import type * as wahapedia from '../types/wahapedia.js';
import { sortByName } from './common.js';

export const toDepotEnhancement = (enhancement: wahapedia.Enhancement): Enhancement => ({
  id: enhancement.id,
  factionId: enhancement.factionId,
  name: enhancement.name,
  legend: enhancement.legend,
  description: enhancement.description,
  cost: enhancement.cost,
  detachment: enhancement.detachment,
  ...(enhancement.upgrade === 'true' ? { upgrade: true } : {}),
  ...(enhancement.supportLeader ? { supportLeader: enhancement.supportLeader } : {})
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
      legend: row.legend ?? '',
      type: row.type ?? '',
      dp: row.dp ?? '',
      forceDisposition: row.forceDisposition ?? '',
      chapterDp: chapterDp
        .filter((entry) => entry.detachmentId === row.id)
        .map((entry) => ({ keyword: entry.keyword, dp: entry.dp })),
      abilities: sortByName(abilities.filter((ability) => ability.detachmentId === row.id)),
      enhancements: sortByName(
        enhancements
          .filter((enhancement) => enhancement.detachmentId === row.id)
          .map(toDepotEnhancement)
      ),
      stratagems: sortByName(stratagems.filter((stratagem) => stratagem.detachmentId === row.id))
    };
  });

  return sortByName(built);
};

export const formatDetachmentOptionLabel = (
  detachment: Pick<Detachment, 'name' | 'type' | 'dp' | 'forceDisposition'>
): string => {
  if (detachment.type) {
    return `${detachment.name} · ${detachment.type}`;
  }

  const parts = [detachment.name];
  if (detachment.dp) {
    parts.push(`${detachment.dp} DP`);
  }
  if (detachment.forceDisposition) {
    parts.push(detachment.forceDisposition);
  }
  return parts.join(' · ');
};

export const formatChapterDpLine = (chapterDp: { keyword: string; dp: string }[]): string =>
  chapterDp.map((entry) => `${entry.keyword} ${entry.dp} DP`).join(', ');

export const matchDetachment = (
  current: { id?: string; slug?: string; name?: string } | undefined,
  candidates: Detachment[]
): Detachment | undefined => {
  if (!current || candidates.length === 0) {
    return undefined;
  }

  if (current.id) {
    const byId = candidates.find((entry) => entry.id === current.id);
    if (byId) {
      return byId;
    }
  }

  if (current.slug) {
    const bySlug = candidates.find((entry) => entry.slug === current.slug);
    if (bySlug) {
      return bySlug;
    }
  }

  if (current.name) {
    const byName = candidates.find((entry) => entry.name === current.name);
    if (byName) {
      return byName;
    }
  }

  return undefined;
};
