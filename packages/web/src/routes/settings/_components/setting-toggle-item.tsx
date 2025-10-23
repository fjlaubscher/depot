import { ToggleSwitch } from '@/components/ui';

interface SettingToggleItemProps {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const SettingToggleItem: React.FC<SettingToggleItemProps> = ({
  title,
  description,
  enabled,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
      </div>
      <ToggleSwitch label="" enabled={enabled} onChange={onChange} size="sm" />
    </div>
  );
};

export default SettingToggleItem;
