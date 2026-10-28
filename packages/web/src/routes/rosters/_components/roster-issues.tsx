import { useMemo, type FC } from 'react';
import type { depot } from '@depot/core';
import { getBattleSize, validateRoster } from '@depot/core/utils/roster-legality';

import { Alert } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { formatRosterIssue } from '@/utils/roster';

const RosterIssues: FC<{ roster: depot.Roster }> = ({ roster }) => {
  const { t } = useTranslation('rosters');
  const issues = useMemo(() => validateRoster(roster), [roster]);
  if (issues.length === 0) {
    return null;
  }
  const size = getBattleSize(roster.points.max);
  return (
    <Alert
      variant="warning"
      title={t('legality.title', { count: issues.length, battleSize: size.name })}
      data-testid="roster-issues"
    >
      <ul className="list-disc pl-4 text-sm">
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${index}`}>{formatRosterIssue(issue, t)}</li>
        ))}
      </ul>
    </Alert>
  );
};

export default RosterIssues;
