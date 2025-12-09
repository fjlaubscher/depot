export interface BreadcrumbItem {
  label: string;
  path: string;
}

export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;

    let label = segment.replace(/-/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);

    breadcrumbs.push({ label, path });
  });

  return breadcrumbs;
};
