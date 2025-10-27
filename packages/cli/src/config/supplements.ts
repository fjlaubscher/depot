export interface SupplementInfo {
  slug: string;
  name?: string;
}

type SupplementConfig = Record<string, Record<string, SupplementInfo>>;

const supplements: SupplementConfig = {
  SM: {
    '000000139': { slug: 'codex', name: 'Codex' },
    '000000362': { slug: 'codex', name: 'Codex' },
    '000000356': { slug: 'codex', name: 'Codex (Legends)' },
    '000000021': { slug: 'blood-angels', name: 'Blood Angels' },
    '000000376': { slug: 'blood-angels', name: 'Blood Angels (Legends)' },
    '000000023': { slug: 'dark-angels', name: 'Dark Angels' },
    '000000373': { slug: 'dark-angels', name: 'Dark Angels (Legends)' },
    '000000036': { slug: 'space-wolves', name: 'Space Wolves' },
    '000000360': { slug: 'space-wolves', name: 'Space Wolves (Legends)' },
    '000000162': { slug: 'black-templars', name: 'Black Templars' },
    '000000372': { slug: 'black-templars', name: 'Black Templars (Legends)' },
    '000000035': { slug: 'deathwatch', name: 'Deathwatch' },
    '000000287': { slug: 'ultramarines-legends', name: 'Ultramarines (Legends)' },
    '000000363': { slug: 'imperial-agents-legends', name: 'Imperial Agents (Legends)' }
  }
};

export const getSupplementInfo = (
  factionId: string,
  sourceId: string | undefined
): SupplementInfo | undefined => {
  if (!sourceId) {
    return undefined;
  }

  const factionSupplements = supplements[factionId];
  if (!factionSupplements) {
    return undefined;
  }

  return factionSupplements[sourceId];
};
