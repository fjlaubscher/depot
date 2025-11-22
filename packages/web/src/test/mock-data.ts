import type { depot } from '@depot/core';

/**
 * Mock data utilities for testing
 * Provides reusable mock data structures for consistent testing
 */

export const mockDatasheet: depot.Datasheet = {
  id: 'captain',
  slug: 'captain',
  name: 'Captain',
  factionId: 'SM',
  factionSlug: 'space-marines',
  sourceId: 'core',
  sourceName: 'Faction Pack: Space Marines',
  legend: '',
  role: 'CHARACTER', // Updated for 10th edition
  loadout: '',
  transport: '',
  virtual: false,
  leaderHead: '',
  leaderFooter: '',
  damagedW: '',
  damagedDescription: '',
  link: '/datasheet/captain',
  isForgeWorld: false,
  isLegends: false,
  leaders: [],
  modelCosts: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      description: 'Captain',
      cost: '80'
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '2',
      description: 'Captain with Jump Pack',
      cost: '90'
    }
  ],
  models: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      name: 'Captain',
      m: '6"',
      t: '4',
      sv: '3+',
      invSv: '4++',
      invSvDescr: 'Iron Halo',
      w: '4',
      ld: '6+',
      oc: '1',
      baseSize: '32mm',
      baseSizeDescr: ''
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '2',
      name: 'Lieutenant',
      m: '5"',
      t: '4',
      sv: '3+',
      invSv: '',
      invSvDescr: '',
      w: '3',
      ld: '7+',
      oc: '1',
      baseSize: '32mm',
      baseSizeDescr: ''
    }
  ],
  wargear: [
    {
      id: 'captain-bolt-pistol',
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      name: 'Bolt pistol',
      type: 'Ranged',
      profiles: [
        {
          datasheetId: 'SM_CAPTAIN',
          line: '1',
          lineInWargear: '1',
          dice: '',
          name: 'Bolt pistol',
          description: '',
          profileName: undefined,
          range: '12',
          type: 'Ranged',
          a: '1',
          bsWs: '2',
          s: '4',
          ap: '0',
          d: '1'
        }
      ]
    },
    {
      id: 'captain-plasma-gun',
      datasheetId: 'SM_CAPTAIN',
      line: '2',
      name: 'Plasma gun',
      type: 'Mixed',
      profiles: [
        {
          datasheetId: 'SM_CAPTAIN',
          line: '2',
          lineInWargear: '1',
          dice: '',
          name: 'Plasma gun – standard',
          profileName: 'Standard',
          description: '[RAPID FIRE 1]',
          range: '24',
          type: 'Ranged',
          a: '1',
          bsWs: '3',
          s: '7',
          ap: '-2',
          d: '1'
        },
        {
          datasheetId: 'SM_CAPTAIN',
          line: '3',
          lineInWargear: '2',
          dice: '',
          name: 'Plasma gun – supercharge',
          profileName: 'Supercharge',
          description: '[RAPID FIRE 1], [HAZARDOUS]',
          range: '24',
          type: 'Ranged',
          a: '1',
          bsWs: '3',
          s: '8',
          ap: '-3',
          d: '2'
        }
      ]
    },
    {
      id: 'captain-power-sword',
      datasheetId: 'SM_CAPTAIN',
      line: '4',
      name: 'Power sword',
      type: 'Melee',
      profiles: [
        {
          datasheetId: 'SM_CAPTAIN',
          line: '4',
          lineInWargear: '1',
          dice: '',
          name: 'Power sword',
          profileName: undefined,
          description: '',
          range: 'Melee',
          type: 'Melee',
          a: '4',
          bsWs: '2',
          s: '5',
          ap: '-2',
          d: '2'
        }
      ]
    },
    {
      id: 'captain-thunder-hammer',
      datasheetId: 'SM_CAPTAIN',
      line: '5',
      name: 'Thunder hammer',
      type: 'Melee',
      profiles: [
        {
          datasheetId: 'SM_CAPTAIN',
          line: '5',
          lineInWargear: '1',
          dice: '',
          name: 'Thunder hammer',
          profileName: undefined,
          description: '[DEVASTATING WOUNDS]',
          range: 'Melee',
          type: 'Melee',
          a: '3',
          bsWs: 'N/A',
          s: '8',
          ap: '-2',
          d: '3'
        }
      ]
    }
  ],
  abilities: [
    {
      id: 'leader',
      name: 'Leader',
      legend: '',
      factionId: 'SM',
      description: 'This model can be attached to a unit.',
      type: 'Core'
    }
  ],
  keywords: [
    { datasheetId: 'SM_CAPTAIN', keyword: 'INFANTRY', model: '', isFactionKeyword: 'false' },
    { datasheetId: 'SM_CAPTAIN', keyword: 'CHARACTER', model: '', isFactionKeyword: 'false' },
    { datasheetId: 'SM_CAPTAIN', keyword: 'IMPERIUM', model: '', isFactionKeyword: 'true' },
    { datasheetId: 'SM_CAPTAIN', keyword: 'ADEPTUS ASTARTES', model: '', isFactionKeyword: 'true' }
  ],
  unitComposition: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      description: '1 Captain'
    }
  ],
  options: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      button: '',
      description: 'This model may be equipped with a jump pack.'
    }
  ],
  stratagems: [
    {
      id: 'rapid-fire',
      name: 'Rapid Fire',
      factionId: 'SM',
      type: 'Battle Tactic',
      cpCost: '1',
      turn: 'Any',
      detachment: 'Any',
      legend: '',
      phase: 'Any',
      description: 'Test stratagem description'
    }
  ],
  enhancements: [],
  detachmentAbilities: []
};

export const mockStratagem: depot.Stratagem = {
  id: 'rapid-fire',
  name: 'Rapid Fire',
  factionId: 'SM',
  type: 'Battle Tactic',
  cpCost: '1',
  turn: 'Any',
  detachment: 'Any',
  legend: '',
  phase: 'Any',
  description: 'Test stratagem description'
};

export const mockEnhancement: depot.Enhancement = {
  id: 'artificer-armour',
  name: 'Artificer Armour',
  factionId: 'SM',
  cost: '10',
  description: 'Enhanced armor protection',
  legend: '',
  detachment: 'Gladius Task Force'
};

export const mockWargearAbility: depot.Ability = {
  id: 'wargear-ability-1',
  name: 'Frag Grenades',
  legend: 'Frag Grenades',
  factionId: 'SM',
  description: 'Explosive shrapnel blooms outward.',
  type: 'Wargear',
  parameter: ''
};

export const createMockWargearAbility = (
  overrides: Partial<depot.Ability> = {}
): depot.Ability => ({
  ...mockWargearAbility,
  ...overrides,
  id: overrides.id ?? mockWargearAbility.id
});

export const mockDetachmentAbility: depot.DetachmentAbility = {
  id: 'combat-doctrines',
  name: 'Combat Doctrines',
  factionId: 'SM',
  description: 'Space Marines combat doctrines ability',
  legend: '',
  detachment: 'Gladius Task Force'
};

export const mockDetachment: depot.Detachment = {
  slug: 'gladius-task-force',
  name: 'Gladius Task Force',
  abilities: [mockDetachmentAbility],
  enhancements: [mockEnhancement],
  stratagems: [mockStratagem]
};

export const mockFaction: depot.Faction = {
  id: 'SM',
  slug: 'space-marines',
  name: 'Space Marines',
  link: '/faction/space-marines',
  datasheets: [mockDatasheet],
  detachments: [mockDetachment]
};

export const toFactionManifest = (faction: depot.Faction): depot.FactionManifest => ({
  id: faction.id,
  slug: faction.slug,
  name: faction.name,
  link: faction.link,
  datasheets: faction.datasheets.map((sheet) => ({
    id: sheet.id,
    slug: sheet.slug,
    name: sheet.name,
    factionId: sheet.factionId,
    factionSlug: sheet.factionSlug,
    role: sheet.role,
    path: `/data/factions/${sheet.factionSlug}/datasheets/${sheet.id}.json`,
    supplementSlug: sheet.supplementSlug,
    supplementName: sheet.supplementName,
    link: sheet.link,
    isForgeWorld: sheet.isForgeWorld,
    isLegends: sheet.isLegends
  })),
  detachments: faction.detachments,
  datasheetCount: faction.datasheets.length,
  detachmentCount: faction.detachments.length
});

export const mockFactionManifest: depot.FactionManifest = toFactionManifest(mockFaction);

export const mockFactionIndexes: depot.Index[] = [
  {
    id: 'SM',
    slug: 'space-marines',
    name: 'Space Marines',
    path: '/data/factions/space-marines/faction.json'
  },
  {
    id: 'CSM',
    slug: 'chaos-space-marines',
    name: 'Chaos Space Marines',
    path: '/data/factions/chaos-space-marines/faction.json'
  },
  {
    id: 'IG',
    slug: 'astra-militarum',
    name: 'Astra Militarum',
    path: '/data/factions/astra-militarum/faction.json'
  }
];

/**
 * Factory functions for creating test data variations
 */

export const createMockDatasheet = (overrides: Partial<depot.Datasheet> = {}): depot.Datasheet => ({
  ...mockDatasheet,
  ...overrides
});

export const createMockFaction = (overrides: Partial<depot.Faction> = {}): depot.Faction => ({
  ...mockFaction,
  ...overrides
});

export const createMockFactionManifest = (
  overrides: Partial<depot.FactionManifest> = {}
): depot.FactionManifest => ({
  ...mockFactionManifest,
  ...overrides
});

export const createMockStratagem = (overrides: Partial<depot.Stratagem> = {}): depot.Stratagem => ({
  ...mockStratagem,
  ...overrides
});

/**
 * Common test data variations
 */

export const mockDatasheetWithoutCosts = createMockDatasheet({
  modelCosts: []
});

export const mockDatasheetWithSingleCost = createMockDatasheet({
  modelCosts: [{ description: 'Captain', cost: '80', datasheetId: 'SM_CAPTAIN', line: '1' }]
});

export const mockDatasheetWithMultipleStratagems = createMockDatasheet({
  stratagems: [
    mockStratagem,
    createMockStratagem({
      id: 'honor-the-chapter',
      name: 'Honor the Chapter',
      type: 'Strategic Ploy',
      cpCost: '2',
      description: 'Honor the chapter stratagem'
    })
  ]
});

export const mockFactionWithoutDatasheets = createMockFaction({
  datasheets: []
});

export const mockEmptyFaction = createMockFaction({
  datasheets: [],
  detachments: []
});

/**
 * Roster-related mock data
 */

export const mockRosterUnit: depot.RosterUnit = {
  id: 'roster-unit-1',
  datasheet: mockDatasheet,
  modelCost: mockDatasheet.modelCosts[0],
  selectedWargear: [],
  selectedWargearAbilities: [],
  datasheetSlug: mockDatasheet.slug
};

export const mockFactionIndex: depot.Index = {
  id: 'SM',
  slug: 'space-marines',
  name: 'Space Marines',
  path: '/data/factions/space-marines/faction.json',
  datasheetCount: 50,
  detachmentCount: 4
};

export const mockRoster: depot.Roster = {
  id: 'test-roster-1',
  name: 'Test Space Marines Roster',
  factionId: 'SM',
  factionSlug: 'space-marines',
  faction: mockFactionIndex,
  detachment: mockDetachment,
  points: {
    current: 80,
    max: 2000
  },
  warlordUnitId: null,
  units: [mockRosterUnit],
  enhancements: []
};

export const createMockDetachment = (
  overrides: Partial<depot.Detachment> = {}
): depot.Detachment => ({
  ...mockDetachment,
  ...overrides
});

export const createMockRosterUnit = (
  overrides: Partial<depot.RosterUnit> = {}
): depot.RosterUnit => ({
  ...mockRosterUnit,
  ...overrides
});

export const createMockRoster = (overrides: Partial<depot.Roster> = {}): depot.Roster => ({
  ...mockRoster,
  ...overrides
});

/**
 * Common roster test data variations
 */

export const mockEmptyRoster = createMockRoster({
  id: 'empty-roster',
  name: 'Empty Roster',
  points: { current: 0, max: 2000 },
  units: [],
  enhancements: []
});

export const mockFullRoster = createMockRoster({
  id: 'full-roster',
  name: 'Full Roster',
  points: { current: 2000, max: 2000 },
  units: [mockRosterUnit, createMockRosterUnit({ id: 'roster-unit-2' })]
});
