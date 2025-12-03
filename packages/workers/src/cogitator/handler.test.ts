import type { depot } from '@depot/core';
import { describe, expect, it, vi } from 'vitest';

import type { WorkerEnv } from '../types.js';
import { handleCogitatorRequest, isRosterAnalysisRequest } from './handler.js';

const baseEnv: WorkerEnv = { OPENAI_API_KEY: 'test-key' };

describe('handleCogitatorRequest', () => {
  it('returns 500 when API key is missing', async () => {
    const request = createRequest({ task: 'roster-analysis', roster: createMockRoster() });
    const response = await handleCogitatorRequest(request, { OPENAI_API_KEY: '' });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Cogitator is not configured (missing OPENAI_API_KEY).'
    });
  });

  it('returns 400 for invalid JSON', async () => {
    const request = new Request('https://example.com/api/cogitator', {
      method: 'POST',
      body: 'not-json',
      headers: { 'content-type': 'application/json' }
    });

    const response = await handleCogitatorRequest(request, baseEnv);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON body.' });
  });

  it('returns 400 for an invalid task', async () => {
    const request = createRequest({ task: 'invalid-task', roster: createMockRoster() });
    const response = await handleCogitatorRequest(request, baseEnv);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid request body. Expected task="roster-analysis" and a roster object.'
    });
  });

  it('returns analysis output from OpenAI', async () => {
    const request = createRequest({ task: 'roster-analysis', roster: createMockRoster() });
    const client = createMockOpenAIClient({ output_text: 'Here is your analysis.' });

    const response = await handleCogitatorRequest(request, baseEnv, { client });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      task: 'roster-analysis',
      output: 'Here is your analysis.'
    });
    expect(client.responses.create).toHaveBeenCalled();
  });

  it('falls back to streamed content when output_text is missing', async () => {
    const request = createRequest({ task: 'roster-analysis', roster: createMockRoster() });
    const client = createMockOpenAIClient({
      output_text: undefined,
      output: [{ content: [{ text: 'Fallback content' }] }]
    });

    const response = await handleCogitatorRequest(request, baseEnv, { client });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.output).toBe('Fallback content');
  });

  it('returns 502 when OpenAI returns empty content', async () => {
    const request = createRequest({ task: 'roster-analysis', roster: createMockRoster() });
    const client = createMockOpenAIClient({
      output_text: '',
      output: [{ content: [] }]
    });

    const response = await handleCogitatorRequest(request, baseEnv, { client });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Cogitator did not return any content.'
    });
  });

  it('returns 502 when OpenAI throws', async () => {
    const request = createRequest({ task: 'roster-analysis', roster: createMockRoster() });
    const logger = { error: vi.fn() };
    const client = createMockOpenAIClient({ output_text: 'will-not-be-used' }, true);

    const response = await handleCogitatorRequest(request, baseEnv, { client, logger });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Failed to run roster analysis. Please try again later.'
    });
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('isRosterAnalysisRequest', () => {
  it('validates correct shape', () => {
    const roster = createMockRoster();
    expect(isRosterAnalysisRequest({ task: 'roster-analysis', roster })).toBe(true);
  });

  it('rejects invalid payloads', () => {
    expect(isRosterAnalysisRequest(null)).toBe(false);
    expect(isRosterAnalysisRequest({ task: 'roster-analysis' })).toBe(false);
    expect(isRosterAnalysisRequest({})).toBe(false);
  });
});

const createRequest = (body: unknown): Request =>
  new Request('https://example.com/api/cogitator', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  });

const createMockOpenAIClient = (response: Record<string, unknown>, shouldThrow = false) => ({
  responses: {
    create: vi.fn(async () => {
      if (shouldThrow) {
        throw new Error('OpenAI failure');
      }

      return response;
    })
  }
});

const createMockDatasheet = (): depot.Datasheet => ({
  id: 'unit-1',
  slug: 'unit-1',
  name: 'Unit 1',
  factionId: 'FACTION',
  factionSlug: 'faction',
  sourceId: 'core',
  sourceName: 'Core',
  legend: '',
  role: 'BATTLELINE',
  loadout: '',
  transport: '',
  virtual: false,
  leaderHead: '',
  leaderFooter: '',
  damagedW: '',
  damagedDescription: '',
  link: '/datasheet/unit-1',
  abilities: [],
  keywords: [{ datasheetId: 'unit-1', keyword: 'INFANTRY', model: '', isFactionKeyword: 'false' }],
  models: [
    {
      datasheetId: 'unit-1',
      line: '1',
      name: 'Unit 1',
      m: '6"',
      t: '4',
      sv: '3+',
      invSv: '',
      invSvDescr: '',
      w: '2',
      ld: '6+',
      oc: '1',
      baseSize: '32mm',
      baseSizeDescr: ''
    }
  ],
  options: [],
  wargear: [],
  unitComposition: [{ datasheetId: 'unit-1', line: '1', description: '1 model' }],
  modelCosts: [{ datasheetId: 'unit-1', line: '1', description: 'Unit 1', cost: '100' }],
  stratagems: [],
  enhancements: [],
  detachmentAbilities: [],
  leaders: [],
  isForgeWorld: false,
  isLegends: false
});

const createMockRoster = (overrides: Partial<depot.Roster> = {}): depot.Roster => ({
  id: 'roster-1',
  name: 'Test Roster',
  factionId: 'FACTION',
  factionSlug: 'faction',
  faction: {
    id: 'FACTION',
    slug: 'faction',
    name: 'Test Faction',
    path: '/data/factions/faction/faction.json'
  },
  detachment: {
    slug: 'test-detachment',
    name: 'Test Detachment',
    abilities: [],
    enhancements: [],
    stratagems: []
  },
  dataVersion: null,
  points: { current: 1000, max: 2000 },
  warlordUnitId: null,
  units: [
    {
      id: 'unit-1',
      datasheet: createMockDatasheet(),
      modelCost: { datasheetId: 'unit-1', line: '1', description: 'Unit 1', cost: '100' },
      selectedWargear: [],
      selectedWargearAbilities: [],
      datasheetSlug: 'unit-1'
    }
  ],
  enhancements: [],
  ...overrides
});
