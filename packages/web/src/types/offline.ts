import type { depot } from '@depot/core';

export interface CachedFaction {
  id: string;
  slug: string;
  name: string;
  cachedDatasheets: number;
}
