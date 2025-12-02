import { useCallback } from 'react';

/**
 * Lightweight helper to trigger client-side downloads for generated content.
 */
export const useDownloadFile = () => {
  return useCallback(
    (filename: string, data: BlobPart | BlobPart[], mimeType = 'application/json') => {
      if (typeof window === 'undefined') return;

      const blob =
        data instanceof Blob
          ? data
          : new Blob(Array.isArray(data) ? data : [data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    []
  );
};

export default useDownloadFile;
