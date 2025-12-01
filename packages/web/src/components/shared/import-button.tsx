import { useRef } from 'react';
import type { ChangeEvent, FC } from 'react';
import { Upload } from 'lucide-react';

import { Button } from '@/components/ui';

type ImportButtonProps = {
  label?: string;
  accept?: string;
  onFileSelected: (file: File) => void;
  buttonTestId?: string;
  inputTestId?: string;
};

const ImportButton: FC<ImportButtonProps> = ({
  label = 'Import',
  accept = 'application/json,.json',
  onFileSelected,
  buttonTestId = 'import-button',
  inputTestId = 'import-input'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    event.target.value = '';
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        data-testid={buttonTestId}
      >
        <span className="inline-flex items-center gap-2">
          <Upload size={16} />
          {label}
        </span>
      </Button>
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept={accept}
        onChange={handleChange}
        data-testid={inputTestId}
      />
    </>
  );
};

export default ImportButton;
