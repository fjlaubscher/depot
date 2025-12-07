import { useSettingsContext } from '@/contexts/settings/use-settings-context';

export const useSettings = () => {
  const { state, updateSettings } = useSettingsContext();
  return {
    settings: state.settings,
    status: state.status,
    error: state.error,
    updateSettings
  };
};

export default useSettings;
