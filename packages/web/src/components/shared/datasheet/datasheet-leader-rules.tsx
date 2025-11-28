import type { FC } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';
import type { DatasheetListItem } from '@/types/datasheets';

import { CollapsibleSection } from '@/components/ui';

interface DatasheetLeaderRulesProps {
  datasheet: depot.Datasheet;
  factionDatasheets: DatasheetListItem[];
}

interface LeaderTarget {
  key: string;
  name: string;
  path?: string;
}

const formatLeaderName = (slug: string, fallback: string) => {
  if (!slug) {
    return fallback;
  }

  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const DatasheetLeaderRules: FC<DatasheetLeaderRulesProps> = ({ datasheet, factionDatasheets }) => {
  const { leaderFooter, leaders } = datasheet;
  const leaderHead =
    datasheet.leaderHead?.trim() || 'This leader can be attached to the following units.';

  const leaderTargets = useMemo<LeaderTarget[]>(() => {
    if (!leaders.length) {
      return [];
    }

    const targets = new Map<string, LeaderTarget>();

    leaders.forEach((leader) => {
      const key = leader.slug || leader.id;
      if (!key || targets.has(key)) {
        return;
      }

      const match = factionDatasheets.find(
        (candidate) => candidate.id === leader.id || candidate.slug === leader.slug
      );

      const name = match?.name || formatLeaderName(leader.slug, leader.id);
      const factionSlug = match?.factionSlug || datasheet.factionSlug;
      const slug = match?.slug || leader.slug;

      targets.set(key, {
        key,
        name,
        path: slug ? `/faction/${factionSlug}/datasheet/${slug}` : undefined
      });
    });

    return Array.from(targets.values());
  }, [datasheet.factionSlug, factionDatasheets, leaders]);

  const hasLeaderContent = Boolean(leaderTargets.length);

  if (!hasLeaderContent) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Leader"
      defaultExpanded={false}
      className="w-full"
      dataTestId="datasheet-leader-rules"
    >
      <div className="flex flex-col gap-2 text-sm text-body">
        <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: leaderHead }} />

        {leaderTargets.length ? (
          <ul className="mt-1 list-disc pl-5">
            {leaderTargets.map((target) => (
              <li key={target.key} data-testid="leader-target">
                {target.path ? (
                  <Link
                    to={target.path}
                    className="text-primary-600 hover:underline focus:underline dark:text-primary-400"
                  >
                    {target.name}
                  </Link>
                ) : (
                  target.name
                )}
              </li>
            ))}
          </ul>
        ) : null}

        {leaderFooter?.trim() ? (
          <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: leaderFooter }} />
        ) : null}
      </div>
    </CollapsibleSection>
  );
};

export default DatasheetLeaderRules;
