import type { FC } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';

import { Card } from '@/components/ui';

interface DatasheetLeaderRulesProps {
  datasheet: depot.Datasheet;
  factionDatasheets: depot.Datasheet[];
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
  const { leaderHead, leaderFooter, leaders } = datasheet;

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

  const hasLeaderContent = Boolean(
    leaderHead?.trim() || leaderFooter?.trim() || leaderTargets.length
  );

  if (!hasLeaderContent) {
    return null;
  }

  return (
    <Card className="flex flex-col gap-3 p-4" data-testid="datasheet-leader-rules">
      {leaderHead?.trim() ? (
        <div
          className="text-sm text-gray-700 dark:text-gray-300 [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: leaderHead }}
        />
      ) : null}

      {leaderTargets.length ? (
        <ul className="list-disc space-y-1 pl-5">
          {leaderTargets.map((target) => (
            <li
              key={target.key}
              className="text-sm text-gray-700 dark:text-gray-300"
              data-testid="leader-target"
            >
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
        <div
          className="text-sm text-gray-700 dark:text-gray-300 [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: leaderFooter }}
        />
      ) : null}
    </Card>
  );
};

export default DatasheetLeaderRules;
