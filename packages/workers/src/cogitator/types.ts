import type { depot } from '@depot/core';

export type RosterAnalysisRequest = {
  task: 'roster-analysis';
  roster: depot.Roster;
};

export type RosterAnalysisResponse = {
  task: 'roster-analysis';
  output: string;
};
