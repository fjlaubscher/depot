import { useMemo, type FC } from 'react';
import type { depot } from '@depot/core';
import { getBattleSize, validateRoster } from '@depot/core/utils/roster-legality';

import { Alert } from '@/components/ui';

const RosterIssues: FC<{ roster: depot.Roster }> = ({ roster }) => {
  const issues = useMemo(() => validateRoster(roster), [roster]);
  if (issues.length === 0) {
    return null;
  }
  const size = getBattleSize(roster.points.max);
  return (
    <Alert
      variant="warning"
      title={`${issues.length} list legality issue${issues.length === 1 ? '' : 's'} (${size.name})`}
      data-testid="roster-issues"
    >
      <ul className="list-disc pl-4 text-sm">
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${index}`}>{issue.message}</li>
        ))}
      </ul>
    </Alert>
  );
};

export default RosterIssues;
