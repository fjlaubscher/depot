export const safeSlug = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_');

  return normalized.replace(/^_+|_+$/g, '') || 'item';
};
