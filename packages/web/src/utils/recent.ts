/** Sort by updatedAt descending; items without a timestamp sink to the bottom. */
export const byUpdatedAtDesc = <T extends { updatedAt?: string | null }>(a: T, b: T): number => {
  const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
  const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
  return bTime - aTime;
};

export const takeRecent = <T extends { updatedAt?: string | null }>(
  items: T[],
  limit: number
): T[] => [...items].sort(byUpdatedAtDesc).slice(0, limit);

const UNITS: [seconds: number, suffix: string][] = [
  [86400, 'D'],
  [3600, 'H'],
  [60, 'M']
];

/** Compact age for meta lines — `2H`, `3D`, or `NOW` under a minute. */
export const relativeTime = (iso?: string | null, now: number = Date.now()): string => {
  if (!iso) return 'NEVER';
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  const unit = UNITS.find(([size]) => seconds >= size);
  return unit ? `${Math.floor(seconds / unit[0])}${unit[1]} AGO` : 'JUST NOW';
};
