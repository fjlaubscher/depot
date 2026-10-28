import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { createMockRoster, createMockRosterUnit } from '@/test/mock-data';
import { generateRosterShareText, formatRosterIssue } from './roster';
import type { RosterIssue } from '@depot/core/utils/roster-legality';

describe('roster presentation', () => {
  it('uses the language active at sharing time and preserves source names and options', async () => {
    const unit = createMockRosterUnit();
    const roster = createMockRoster({ name: 'Ma liste', units: [unit], warlordUnitId: unit.id });
    expect(generateRosterShareText(roster, 'Space Marines')).toContain('[Warlord]');
    await i18n.changeLanguage('fr');
    const text = generateRosterShareText(roster, 'Space Marines');
    expect(text).toContain('[Seigneur de guerre]');
    expect(text).toContain(roster.name);
    expect(text).toContain(unit.datasheet.name);
    expect(text).toContain('*Détachement:');
    expect(text).toContain('http');
    expect(
      generateRosterShareText({
        ...roster,
        detachments: [...roster.detachments, ...roster.detachments]
      })
    ).toContain('*Détachements:');
  });

  const cases: [RosterIssue, string, string][] = [
    [
      { code: 'points', reason: 'points-exceeded', params: { current: 2100, max: 2000 } },
      '2100 pts exceeds the 2000 pt limit.',
      '2100 pts dépassent la limite de 2000 pts.'
    ],
    [
      { code: 'detachment', reason: 'detachment-missing', params: {} },
      'No detachment selected.',
      'Aucun détachement sélectionné.'
    ],
    [
      { code: 'detachment', reason: 'detachment-duplicate', params: {} },
      'The same detachment is selected more than once.',
      'Le même détachement est sélectionné plusieurs fois.'
    ],
    [
      { code: 'warlord', reason: 'warlord-missing', params: {} },
      'No Warlord selected.',
      'Aucun seigneur de guerre sélectionné.'
    ],
    [
      {
        code: 'dp',
        reason: 'dp-exceeded',
        params: { spent: 4, max: 3, battleSize: 'Strike Force' }
      },
      '4 DP spent; Strike Force allows 3 DP.',
      '4 DP dépensés ; Strike Force autorise 3 DP.'
    ],
    [
      {
        code: 'unit-limit',
        reason: 'unit-limit-exceeded',
        params: { name: 'Captain', count: 4, limit: 3, battleSize: 'Strike Force' }
      },
      'Captain: 4 units selected; Strike Force allows 3.',
      'Captain : 4 unités sélectionnées ; Strike Force en autorise 3.'
    ],
    [
      { code: 'bracket', reason: 'cost-bracket-mismatch', params: { name: 'Talos', ordinal: 3 } },
      'Talos #3 is using the wrong cost bracket.',
      'Talos n°3 utilise la mauvaise tranche de coût.'
    ],
    [
      { code: 'enhancement', reason: 'enhancement-outside-detachments', params: { name: 'Relic' } },
      'Relic is not from a selected detachment.',
      'Relic ne provient pas d’un détachement sélectionné.'
    ],
    [
      {
        code: 'enhancement',
        reason: 'enhancement-repeat-limit',
        params: { name: 'Relic', count: 2, limit: 1 }
      },
      'Relic is taken 2 times; max 1.',
      'Relic est sélectionnée 2 fois ; maximum 1.'
    ],
    [
      {
        code: 'enhancement',
        reason: 'enhancement-total-limit',
        params: { count: 4, limit: 2, battleSize: 'Incursion' }
      },
      '4 enhancements selected; Incursion allows 2.',
      '4 améliorations sélectionnées ; Incursion en autorise 2.'
    ],
    [
      { code: 'enhancement', reason: 'enhancement-unit-limit', params: { count: 2, limit: 1 } },
      'Unit has 2 enhancements; max 1 per unit.',
      'Unité a 2 améliorations ; maximum 1 par unité.'
    ],
    [
      {
        code: 'enhancement',
        reason: 'enhancement-epic-hero',
        params: { unitName: 'Hero', enhancementName: 'Relic' }
      },
      'Hero is an Epic Hero and cannot take Relic.',
      'Hero est un Héros épique et ne peut pas recevoir Relic.'
    ],
    [
      {
        code: 'enhancement',
        reason: 'enhancement-non-character',
        params: { unitName: 'Trooper', enhancementName: 'Relic' }
      },
      'Trooper is not a Character and cannot take Relic.',
      'Trooper n’est pas un Personnage et ne peut pas recevoir Relic.'
    ],
    [
      { code: 'support', reason: 'support-unmatched', params: { name: 'Painboy' } },
      'Painboy is a Support unit with no free bodyguard unit to attach to.',
      'Painboy est une unité de Soutien sans garde du corps disponible.'
    ]
  ];
  it.each(cases)('formats $0.reason in both languages', (issue, english, french) => {
    expect(formatRosterIssue(issue, i18n.getFixedT('en', 'rosters'))).toBe(english);
    expect(formatRosterIssue(issue, i18n.getFixedT('fr', 'rosters'))).toBe(french);
  });
});
