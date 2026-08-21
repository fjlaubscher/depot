/**
 * Triggers a client-side download for generated content.
 */
export const downloadFile = (filename: string, json: string) => {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const readJsonFile = async <T>(file: File): Promise<T> => JSON.parse(await file.text()) as T;
