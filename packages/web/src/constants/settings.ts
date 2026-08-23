import type { depot } from '@depot/core';

export const DEFAULT_SETTINGS: Required<depot.Settings> = {
  showForgeWorld: false,
  showLegends: false,
  showUnaligned: false,
  includeWargearOnExport: true,
  useNativeShare: true,
  theme: 'system'
};

export const mergeSettingsWithDefaults = (
  settings?: depot.Settings | null
): Required<depot.Settings> => ({
  ...DEFAULT_SETTINGS,
  ...(settings ?? {})
});
