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
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-subtle">{description}</div>
      </div>
      <ToggleSwitch label="" enabled={enabled} onChange={onChange} size="sm" />
    </div>
  );
};

export default SettingToggleItem;
