import type { TFunction } from 'i18next';

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

const UNITS: [seconds: number, key: 'day' | 'hour' | 'minute'][] = [
  [86400, 'day'],
  [3600, 'hour'],
  [60, 'minute']
];

/** Complete edited-age message, keeping the compact minute/hour/day display. */
export const relativeTime = (
  iso: string | null | undefined,
  t: TFunction<'home'>,
  now: number = Date.now()
): string => {
  if (!iso) return t('edited.never');
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  const unit = UNITS.find(([size]) => seconds >= size);
  return unit ? t(`edited.${unit[1]}`, { count: Math.floor(seconds / unit[0]) }) : t('edited.now');
};
