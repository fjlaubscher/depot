import type { depot } from '@depot/core';

export const resolveIndexDataVersion = (index?: depot.Index[] | null): string | null =>
  index?.find((entry) => Boolean(entry.dataVersion))?.dataVersion ?? null;
