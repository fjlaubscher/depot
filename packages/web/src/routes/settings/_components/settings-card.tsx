import type { ReactNode } from 'react';
import { Card } from '@/components/ui';

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, children }) => {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        {children}
      </div>
    </Card>
  );
};

export default SettingsCard;
