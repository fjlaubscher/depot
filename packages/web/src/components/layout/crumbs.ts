export type AppCrumb = { label: string; to?: string };

/** Ancestor links only — the current page is the heading, never a crumb. */
export const resolveAncestors = ({
  crumbs,
  back
}: {
  crumbs?: AppCrumb[];
  back?: { to: string; label: string };
  heading?: { title: string };
  title?: string;
}): AppCrumb[] => {
  if (crumbs && crumbs.length > 0) {
    const last = crumbs[crumbs.length - 1];
    const ancestors = last.to ? crumbs : crumbs.slice(0, -1);
    return ancestors.filter((crumb): crumb is AppCrumb & { to: string } => Boolean(crumb.to));
  }
  if (back) return [{ label: back.label, to: back.to }];
  return [];
};
