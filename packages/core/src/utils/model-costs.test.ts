import { describe, expect, it } from 'vitest';
import type { ModelCost } from '../types/depot.js';
import {
  getCostBracketRange,
  modelCostsForOrdinal,
  formatCostSection,
  formatModelCostLabel,
  formatModelCostOptions,
  groupModelCostsBySection,
  hasNumericCost,
  normalizeModelCosts,
  selectableModelCosts,
  summarizeModelCosts
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

describe('modelCostsForOrdinal', () => {
  const costs = [
    {
      datasheetId: 'a',
      line: '1',
      description: '1 model',
      cost: '75',
      section: 'YOUR 1ST TO 2ND UNITS COST'
    },
    {
      datasheetId: 'a',
      line: '2',
      description: '2 models',
      cost: '150',
      section: 'YOUR 1ST TO 2ND UNITS COST'
    },
    {
      datasheetId: 'a',
      line: '3',
      description: '1 model',
      cost: '85',
      section: 'YOUR 3RD + UNIT COSTS'
    },
    {
      datasheetId: 'a',
      line: '4',
      description: 'per Dark lance',
      cost: '',
      section: 'WARGEAR OPTIONS'
    }
  ];

  it('returns only the rows whose bracket covers the ordinal', () => {
    expect(modelCostsForOrdinal(costs).map((cost) => cost.line)).toEqual(['1', '2']);
    expect(modelCostsForOrdinal(costs, 2).map((cost) => cost.line)).toEqual(['1', '2']);
    expect(modelCostsForOrdinal(costs, 3).map((cost) => cost.line)).toEqual(['3']);
  });

  it('falls back to every selectable row when nothing matches', () => {
    const single = [{ datasheetId: 'a', line: '1', description: '1 model', cost: '75' }];
    expect(modelCostsForOrdinal(single, 9)).toEqual(single);
  });
});

describe('getCostBracketRange', () => {
  it('parses repeat-cost headers into ordinal ranges', () => {
    expect(getCostBracketRange('YOUR 1ST TO 2ND UNITS COST')).toEqual([1, 2]);
    expect(getCostBracketRange('YOUR 1ST TO 3RD UNITS COST')).toEqual([1, 3]);
    expect(getCostBracketRange('YOUR 3RD + UNIT COSTS')).toEqual([3, Infinity]);
    expect(getCostBracketRange('YOUR 1ST UNIT COSTS')).toEqual([1, 1]);
    expect(getCostBracketRange('YOUR 2ND + UNIT COSTS')).toEqual([2, Infinity]);
  });

  it('treats generic or missing headers as covering every unit', () => {
    expect(getCostBracketRange('YOUR UNIT COSTS')).toEqual([1, Infinity]);
    expect(getCostBracketRange(undefined)).toEqual([1, Infinity]);
    expect(getCostBracketRange('WARGEAR OPTIONS')).toEqual([1, Infinity]);
  });
});

describe('summarizeModelCosts', () => {
  const cost = (value: string): ModelCost => ({
    datasheetId: 'd',
    line: value,
    description: '',
    cost: value
  });

  it('returns the cheapest cost, marking sheets with more than one price', () => {
    expect(summarizeModelCosts([cost('65')])).toBe('65');
    expect(summarizeModelCosts([cost('130'), cost('65')])).toBe('65+');
    // same price twice (e.g. repeated bracket) is still a single price
    expect(summarizeModelCosts([cost('65'), cost('65')])).toBe('65');
  });

  it('ignores non-numeric costs and returns null when none remain', () => {
    expect(summarizeModelCosts([cost('-'), cost('80')])).toBe('80');
    expect(summarizeModelCosts([cost('-')])).toBeNull();
    expect(summarizeModelCosts([])).toBeNull();
  });
});

describe('formatModelCostOptions', () => {
  const cost = (description: string, value: string, section?: string): ModelCost => ({
    datasheetId: 'd',
    line: value,
    description,
    cost: value,
    section
  });

  it('drops the bracket when every option shares it', () => {
    const options = formatModelCostOptions([
      cost('5 models', '60', 'YOUR 1ST TO 2ND UNITS COST'),
      cost('10 models', '120', 'YOUR 1ST TO 2ND UNITS COST')
    ]);

    expect(options.map((option) => option.label)).toEqual([
      '5 models (60 pts)',
      '10 models (120 pts)'
    ]);
  });

  it('keeps the bracket when options disagree', () => {
    const options = formatModelCostOptions([
      cost('5 models', '60', 'YOUR 1ST TO 2ND UNITS COST'),
      cost('5 models', '55', 'YOUR 3RD + UNIT COSTS')
    ]);

    expect(options.map((option) => option.label)).toEqual([
      '5 models · 1st to 2nd units (60 pts)',
      '5 models · 3rd+ unit (55 pts)'
    ]);
  });
});
