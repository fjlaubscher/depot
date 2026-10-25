import type { depot } from '@depot/core';
import type { TFunction } from 'i18next';
import type { RosterIssue } from '@depot/core/utils/roster-legality';
import {
  generateRosterShareText as generateRosterShareTextCore,
  getRosterDetachments,
  type GenerateRosterShareTextOptions
} from '@depot/core/utils/roster';
import { buildAbsoluteUrl } from '@/utils/paths';
import i18n from '@/i18n';

export const formatRosterIssue = (issue: RosterIssue, t: TFunction<'rosters'>): string => {
  switch (issue.reason) {
    case 'enhancement-unit-limit':
      return t('legality.enhancement-unit-limit', {
        ...issue.params,
        unitName: issue.params.unitName ?? t('legality.unit')
      });
    case 'points-exceeded':
      return t('legality.points-exceeded', issue.params);
    case 'detachment-missing':
      return t('legality.detachment-missing');
    case 'detachment-duplicate':
      return t('legality.detachment-duplicate');
    case 'warlord-missing':
      return t('legality.warlord-missing');
    case 'dp-exceeded':
      return t('legality.dp-exceeded', issue.params);
    case 'unit-limit-exceeded':
      return t('legality.unit-limit-exceeded', issue.params);
    case 'cost-bracket-mismatch':
      return t('legality.cost-bracket-mismatch', {
        name: issue.params.name,
        position: issue.params.ordinal
      });
    case 'enhancement-outside-detachments':
      return t('legality.enhancement-outside-detachments', issue.params);
    case 'enhancement-repeat-limit':
      return t('legality.enhancement-repeat-limit', issue.params);
    case 'enhancement-total-limit':
      return t('legality.enhancement-total-limit', issue.params);
    case 'enhancement-epic-hero':
      return t('legality.enhancement-epic-hero', issue.params);
    case 'enhancement-non-character':
      return t('legality.enhancement-non-character', issue.params);
    case 'support-unmatched':
      return t('legality.support-unmatched', issue.params);
  }
};

export const generateRosterShareText = (
  roster: depot.Roster,
  factionName?: string,
  options: GenerateRosterShareTextOptions = {}
): string =>
  `${generateRosterShareTextCore(roster, factionName, {
    ...options,
    labels: options.labels ?? {
      faction: i18n.t('rosters:share.faction'),
      detachment: i18n.t('rosters:share.detachment', {
        count: getRosterDetachments(roster).length
      }),
      points: i18n.t('rosters:share.points'),
      warlord: i18n.t('rosters:share.warlord'),
      wargearAbility: i18n.t('rosters:share.wargearAbility'),
      enhancement: i18n.t('rosters:share.enhancement'),
      pointsUnit: i18n.t('rosters:share.pointsUnit')
    }
  })}\n${buildAbsoluteUrl('/')}`;
