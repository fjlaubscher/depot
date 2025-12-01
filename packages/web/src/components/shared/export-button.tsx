import type { FC, MouseEventHandler } from 'react';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui';

type ExportButtonProps = {
  label?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  testId?: string;
  variant?: 'default' | 'secondary';
};

const ExportButton: FC<ExportButtonProps> = ({
  label = 'Export',
  onClick,
  testId = 'export-button',
  variant = 'secondary'
}) => (
  <Button variant={variant} onClick={onClick} className="flex items-center gap-2" data-testid={testId}>
    <Download size={16} />
    {label}
  </Button>
);

export default ExportButton;
