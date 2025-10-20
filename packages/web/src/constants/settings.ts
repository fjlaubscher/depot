import type { depot } from '@depot/core';

export const DEFAULT_SETTINGS: Required<depot.Settings> = {
  showForgeWorld: false,
  showLegends: false,
  showUnaligned: false,
  showFluff: true,
  includeWargearOnExport: true,
  useNativeShare: true
};

export const mergeSettingsWithDefaults = (
  settings?: depot.Settings | null
): Required<depot.Settings> => ({
  ...DEFAULT_SETTINGS,
  ...(settings ?? {})
});
