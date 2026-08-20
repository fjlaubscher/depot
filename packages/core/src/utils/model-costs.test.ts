import { describe, expect, it } from 'vitest';
import {
  formatCostSection,
  formatModelCostLabel,
  groupModelCostsBySection,
  hasNumericCost,
  normalizeModelCosts,
  selectableModelCosts
} from './model-costs.js';

const row = (
  overrides: Partial<{
    datasheetId: string;
    line: string;
    description: string;
    cost: string;
  }> = {}
) => ({
  datasheetId: overrides.datasheetId ?? 'ds-1',
  line: overrides.line ?? '1',
  description: overrides.description ?? '4 models',
  cost: overrides.cost ?? '170'
});

describe('model cost helpers', () => {
  it('detects numeric costs and ignores empty headers', () => {
    expect(hasNumericCost('170')).toBe(true);
    expect(hasNumericCost('0')).toBe(true);
    expect(hasNumericCost('')).toBe(false);
    expect(hasNumericCost('  ')).toBe(false);
    expect(hasNumericCost('N/A')).toBe(false);
  });

  it('drops empty-cost headers and stamps section onto following rows', () => {
    const costs = normalizeModelCosts([
      row({ line: '1', description: 'YOUR 1ST TO 3RD UNITS COST', cost: '' }),
      row({ line: '2', description: '4 models', cost: '170' }),
      row({ line: '3', description: '5 models', cost: '215' }),
      row({ line: '4', description: 'YOUR 4TH + UNIT COSTS', cost: '' }),
      row({ line: '5', description: '4 models', cost: '180' }),
      row({ line: '6', description: 'WARGEAR OPTIONS', cost: '' }),
      row({ line: '7', description: 'YOUR UNIT COSTS', cost: '' })
    ]);

    expect(costs).toEqual([
      {
        datasheetId: 'ds-1',
        line: '2',
        description: '4 models',
        cost: '170',
        section: 'YOUR 1ST TO 3RD UNITS COST'
      },
      {
        datasheetId: 'ds-1',
        line: '3',
        description: '5 models',
        cost: '215',
        section: 'YOUR 1ST TO 3RD UNITS COST'
      },
      {
        datasheetId: 'ds-1',
        line: '5',
        description: '4 models',
        cost: '180',
        section: 'YOUR 4TH + UNIT COSTS'
      }
    ]);
  });

  it('collapses exact duplicate description/cost/section triples', () => {
    const costs = normalizeModelCosts([
      row({ line: '1', description: '1 model', cost: '80' }),
      row({ line: '2', description: '1 model', cost: '80' }),
      row({ line: '3', description: '1 model', cost: '80' })
    ]);

    expect(costs).toEqual([{ datasheetId: 'ds-1', line: '1', description: '1 model', cost: '80' }]);
  });

  it('keeps same size at different section prices and strips HTML headers', () => {
    const costs = normalizeModelCosts([
      row({
        line: '1',
        description: '<b>AGENTS OF THE IMPERIUM Detachment</b>',
        cost: ''
      }),
      row({ line: '2', description: '1 model', cost: '75' }),
      row({ line: '3', description: 'Assigned Agent', cost: '' }),
      row({ line: '4', description: '1 model', cost: '90' })
    ]);

    expect(costs).toEqual([
      {
        datasheetId: 'ds-1',
        line: '2',
        description: '1 model',
        cost: '75',
        section: 'AGENTS OF THE IMPERIUM Detachment'
      },
      {
        datasheetId: 'ds-1',
        line: '4',
        description: '1 model',
        cost: '90',
        section: 'Assigned Agent'
      }
    ]);
  });

  it('normalizes each datasheet independently', () => {
    const costs = normalizeModelCosts([
      row({ datasheetId: 'a', line: '1', description: 'HEADER A', cost: '' }),
      row({ datasheetId: 'b', line: '1', description: '1 model', cost: '40' }),
      row({ datasheetId: 'a', line: '2', description: '1 model', cost: '50' })
    ]);

    expect(costs).toEqual([
      {
        datasheetId: 'a',
        line: '2',
        description: '1 model',
        cost: '50',
        section: 'HEADER A'
      },
      { datasheetId: 'b', line: '1', description: '1 model', cost: '40' }
    ]);
  });

  it('formats option labels with a humanized section', () => {
    expect(formatCostSection('YOUR 1ST TO 3RD UNITS COST')).toBe('1st to 3rd units');
    expect(formatCostSection('YOUR 3RD + UNIT COSTS')).toBe('3rd+ unit');
    expect(formatCostSection('YOUR UNIT COSTS')).toBe('');
    expect(
      formatModelCostLabel({
        description: '4 models',
        cost: '170',
        section: 'YOUR 1ST TO 3RD UNITS COST'
      })
    ).toBe('4 models · 1st to 3rd units (170 pts)');
    expect(formatModelCostLabel({ description: 'Captain', cost: '80' })).toBe('Captain (80 pts)');
    expect(
      formatModelCostLabel({ description: '10 models', cost: '75', section: 'YOUR UNIT COSTS' })
    ).toBe('10 models (75 pts)');
  });

  it('groups selectable costs by bracket in source order', () => {
    const cost = (line: string, description: string, value: string, section?: string) => ({
      datasheetId: 'ds',
      line,
      description,
      cost: value,
      ...(section ? { section } : {})
    });
    expect(
      groupModelCostsBySection([
        cost('1', '5 models', '60', 'YOUR 1ST TO 2ND UNITS COST'),
        cost('2', '10 models', '120', 'YOUR 1ST TO 2ND UNITS COST'),
        cost('3', '5 models', '65', 'YOUR 3RD + UNIT COSTS'),
        cost('4', 'header', '')
      ]).map((group) => ({ section: group.section, lines: group.costs.map((c) => c.line) }))
    ).toEqual([
      { section: '1st to 2nd units', lines: ['1', '2'] },
      { section: '3rd+ unit', lines: ['3'] }
    ]);
    expect(groupModelCostsBySection([cost('1', '10 models', '75', 'YOUR UNIT COSTS')])).toEqual([
      { section: '', costs: [cost('1', '10 models', '75', 'YOUR UNIT COSTS')] }
    ]);
  });

  it('filters to selectable numeric costs', () => {
    expect(
      selectableModelCosts([
        { cost: '', description: 'YOUR UNIT COSTS' },
        { cost: '80', description: '1 model' }
      ]).map((entry) => entry.description)
    ).toEqual(['1 model']);
  });
});
