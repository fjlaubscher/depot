/**
 * Triggers a client-side download for generated content.
 */
export const downloadFile = (
  filename: string,
  data: BlobPart | BlobPart[],
  mimeType = 'application/json'
) => {
  if (typeof window === 'undefined') return;

  const blob =
    data instanceof Blob ? data : new Blob(Array.isArray(data) ? data : [data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const readJsonFile = async <T>(file: File): Promise<T> => {
  try {
    const contents = await file.text();
    return JSON.parse(contents) as T;
  } catch {
    throw new Error('Invalid JSON file');
  }
};
