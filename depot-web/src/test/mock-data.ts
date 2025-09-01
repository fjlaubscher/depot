import { depot } from 'depot-core';

/**
 * Mock data utilities for testing
 * Provides reusable mock data structures for consistent testing
 */

export const mockDatasheet: depot.Datasheet = {
  id: 'captain',
  name: 'Captain',
  factionId: 'SM',
  role: 'CHARACTER', // Updated for 10th edition
  isForgeWorld: false,
  isLegends: false,
  modelCosts: [
    {
      description: 'Captain',
      cost: '80'
    },
    {
      description: 'Captain with Jump Pack',
      cost: '90'
    }
  ],
  models: [
    {
      line: 1,
      name: 'Captain',
      m: '6"',
      t: '4',
      sv: '3+',
      w: '4',
      ld: '6+',
      oc: '1',
      baseSize: '32mm'
    }
  ],
  wargear: [
    {
      line: 1,
      name: 'Bolt pistol',
      type: 'Ranged',
      range: '12',
      a: '1',
      bsWs: '2',
      s: '4',
      ap: '0',
      d: '1',
      description: ''
    },
    {
      line: 2,
      name: 'Power sword',
      type: 'Melee',
      range: '',
      a: '4',
      bsWs: '2',
      s: '5',
      ap: '-2',
      d: '2',
      description: ''
    }
  ],
  abilities: [
    {
      id: 'leader',
      name: 'Leader',
      description: 'This model can be attached to a unit.'
    }
  ],
  keywords: ['INFANTRY', 'CHARACTER', 'IMPERIUM', 'ADEPTUS ASTARTES'],
  unitComposition: [
    {
      line: 1,
      description: '1 Captain'
    }
  ],
  options: [
    {
      line: 1,
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
      description: 'Test stratagem description'
    }
  ]
};

export const mockStratagem: depot.Stratagem = {
  id: 'rapid-fire',
  name: 'Rapid Fire',
  factionId: 'SM',
  type: 'Battle Tactic',
  cpCost: '1',
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

export const mockDetachmentAbility: depot.DetachmentAbility = {
  id: 'combat-doctrines',
  name: 'Combat Doctrines',
  factionId: 'SM',
  description: 'Space Marines combat doctrines ability',
  legend: '',
  detachment: 'Gladius Task Force'
};

export const mockFaction: depot.Faction = {
  id: 'SM',
  name: 'Space Marines',
  link: '/faction/SM',
  datasheets: [mockDatasheet],
  stratagems: [mockStratagem],
  enhancements: [mockEnhancement],
  detachmentAbilities: [mockDetachmentAbility]
};

export const mockFactionIndex: depot.Index[] = [
  { id: 'SM', name: 'Space Marines', path: '/data/sm.json' },
  { id: 'CSM', name: 'Chaos Space Marines', path: '/data/csm.json' },
  { id: 'IG', name: 'Astra Militarum', path: '/data/ig.json' }
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
  modelCosts: [{ description: 'Captain', cost: '80' }]
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
  stratagems: [],
  enhancements: [],
  detachmentAbilities: []
});