import { ExternalLink } from 'lucide-react';

/** depot ships names and numbers; the rules text stays on Wahapedia. */
const RulesLink: React.FC<{ href: string; label?: string }> = ({
  href,
  label = 'Read the full rules on Wahapedia'
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-accent hover:underline focus-ring-primary"
    data-testid="rules-link"
  >
    {label}
    <ExternalLink size={14} />
  </a>
);

export default RulesLink;
