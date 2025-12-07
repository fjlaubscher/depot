import type { depot } from '@depot/core';

export type SettingsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SettingsState {
  settings: depot.Settings;
  status: SettingsStatus;
  error: string | null;
}

export type SettingsAction =
  | { type: 'LOAD_SETTINGS_START' }
  | { type: 'LOAD_SETTINGS_SUCCESS'; payload: depot.Settings }
  | { type: 'LOAD_SETTINGS_ERROR'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: depot.Settings };

export interface SettingsContextType {
  state: SettingsState;
  updateSettings: (settings: depot.Settings) => Promise<void>;
}
