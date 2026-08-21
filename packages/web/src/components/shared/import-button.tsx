import { useRef } from 'react';
import type { ChangeEvent, FC } from 'react';
import { Upload } from 'lucide-react';

import { Button } from '@/components/ui';

type ImportButtonProps = {
  label?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  buttonTestId?: string;
  inputTestId?: string;
};

const ImportButton: FC<ImportButtonProps> = ({
  label = 'Import',
  multiple = false,
  onFilesSelected,
  buttonTestId = 'import-button',
  inputTestId = 'import-input'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        data-testid={buttonTestId}
      >
        <Upload size={16} />
        {label}
      </Button>
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="application/json,.json"
        multiple={multiple}
        onChange={handleChange}
        data-testid={inputTestId}
      />
    </>
  );
};

export default ImportButton;
