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
