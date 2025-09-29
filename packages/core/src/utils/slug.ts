export const slugify = (input: string): string => {
  if (!input) {
    return '';
  }

  const normalized = input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
};

export const createSlugGenerator = (fallback = 'item') => {
  const counts = new Map<string, number>();

  return (value: string) => {
    const base = slugify(value) || fallback;
    const current = counts.get(base) ?? 0;
    counts.set(base, current + 1);

    return current === 0 ? base : `${base}-${current + 1}`;
  };
};
