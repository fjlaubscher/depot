export type AppCrumb = { label: string; to?: string };

const SHORT_TITLE_MAX = 32;

/** Document titles like "Name - Roster Overview" or Home's long tagline stay out of the bar. */
const isShortPageName = (title: string): boolean => {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= SHORT_TITLE_MAX && !trimmed.includes(' - ');
};

export const resolveCrumbs = ({
  crumbs,
  back,
  heading,
  title
}: {
  crumbs?: AppCrumb[];
  back?: { to: string; label: string };
  heading?: { title: string };
  title: string;
}): AppCrumb[] => {
  if (crumbs && crumbs.length > 0) return crumbs;
  if (back) {
    const items: AppCrumb[] = [{ label: back.label, to: back.to }];
    if (heading) items.push({ label: heading.title });
    return items;
  }
  if (heading) return [{ label: heading.title }];
  if (isShortPageName(title)) return [{ label: title.trim() }];
  return [];
};
