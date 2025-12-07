import { DEFAULT_SETTINGS } from '@/constants/settings';
import { SETTINGS_ACTIONS } from './constants';
import type { SettingsAction, SettingsState } from './types';

export const initialSettingsState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  status: 'loading',
  error: null
};

export const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case SETTINGS_ACTIONS.LOAD_SETTINGS_START:
      return { ...state, status: 'loading', error: null };
    case SETTINGS_ACTIONS.LOAD_SETTINGS_SUCCESS:
      return { ...state, status: 'ready', settings: action.payload, error: null };
    case SETTINGS_ACTIONS.LOAD_SETTINGS_ERROR:
      return { ...state, status: 'error', error: action.payload };
    case SETTINGS_ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: action.payload };
    default:
      return state;
  }
};
