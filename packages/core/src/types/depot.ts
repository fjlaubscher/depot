export interface Option {
  id: string;
  slug: string;
  name: string;
}

export interface Ability {
  id: string;
  name: string;
  legend: string;
  factionId: string;
  description: string;
  type: string;
  parameter?: string;
}

export interface Keyword {
  datasheetId: string;
  keyword: string;
  model: string;
  isFactionKeyword: string;
}

export interface Model {
  datasheetId: string;
  line: string;
  name: string;
  m: string;
  t: string;
  sv: string;
  invSv: string;
  invSvDescr: string;
  w: string;
  ld: string;
  oc: string;
  baseSize: string;
  baseSizeDescr: string;
}

export interface DatasheetOption {
  datasheetId: string;
  line: string;
  button: string;
  description: string;
}

export interface DatasheetLeaderReference {
  id: string;
  slug: string;
}

export interface Stratagem {
  id: string;
  factionId: string;
  name: string;
  type: string;
  cpCost: string;
  legend: string;
  turn: string;
  phase: string;
  description: string;
  detachment: string;
}

export interface WargearProfile {
  datasheetId: string;
  line: string;
  lineInWargear: string;
  dice: string;
  name: string;
  profileName?: string;
  description: string;
  range: string;
  type: 'Ranged' | 'Melee';
  a: string;
  bsWs: string;
  s: string;
  ap: string;
  d: string;
}

export interface Wargear {
  id: string;
  datasheetId: string;
  line: string;
  name: string;
  type: 'Ranged' | 'Melee' | 'Mixed';
  profiles: WargearProfile[];
}

export interface UnitComposition {
  datasheetId: string;
  line: string;
  description: string;
}

export interface ModelCost {
  datasheetId: string;
  line: string;
  description: string;
  cost: string;
}

export interface Enhancement {
  id: string;
  factionId: string;
  name: string;
  legend: string;
  description: string;
  cost: string;
  detachment: string;
}

export interface DetachmentAbility {
  id: string;
  factionId: string;
  name: string;
  legend: string;
  description: string;
  detachment: string;
}

export interface Datasheet {
  id: string;
  slug: string;
  name: string;
  factionId: string;
  factionSlug: string;
  sourceId: string;
  sourceName: string;
  supplementSlug?: string;
  supplementName?: string;
  legend: string;
  role: string;
  loadout: string;
  transport: string;
  virtual: boolean;
  leaderHead: string;
  leaderFooter: string;
  damagedW: string;
  damagedDescription: string;
  link: string;
  abilities: Ability[];
  keywords: Keyword[];
  models: Model[];
  options: DatasheetOption[];
  wargear: Wargear[];
  unitComposition: UnitComposition[];
  modelCosts: ModelCost[];
  stratagems: Stratagem[];
  enhancements: Enhancement[];
  detachmentAbilities: DetachmentAbility[];
  leaders: DatasheetLeaderReference[];
  isForgeWorld: boolean;
  isLegends: boolean;
}

export interface DatasheetSummary {
  id: string;
  slug: string;
  name: string;
  factionId: string;
  factionSlug: string;
  role: string;
  path: string;
  supplementSlug?: string;
  supplementName?: string;
  link: string;
  isForgeWorld: boolean;
  isLegends: boolean;
}

export interface FactionManifest {
  id: string;
  slug: string;
  name: string;
  link: string;
  datasheets: DatasheetSummary[];
  detachments: Detachment[];
  datasheetCount: number;
  detachmentCount: number;
}

export interface Faction {
  id: string;
  slug: string;
  name: string;
  link: string;
  datasheets: Datasheet[];
  detachments: Detachment[];
}

export interface Index {
  id: string;
  slug: string;
  name: string;
  path: string;
  datasheetCount?: number;
  detachmentCount?: number;
}

export interface Settings {
  showForgeWorld?: boolean;
  showLegends?: boolean;
  showUnaligned?: boolean;
  showFluff?: boolean;
  includeWargearOnExport?: boolean;
  useNativeShare?: boolean;
  usePileOfShameLabel?: boolean;
}

// Detachment, composed from other types
export interface Detachment {
  slug: string;
  name: string;
  abilities: DetachmentAbility[];
  enhancements: Enhancement[];
  stratagems: Stratagem[];
}

// Represents a single unit added to a roster, including its selected options and cost.
export interface RosterUnit {
  id: string; // A unique ID for this specific instance in the roster
  datasheet: Datasheet;
  modelCost: ModelCost; // The selected model/unit count and its point cost
  selectedWargear: Wargear[];
  /**
   * Selected abilities that are tied to wargear (toggleable per unit).
   * Optional for backward compatibility with older saved rosters.
   */
  selectedWargearAbilities?: Ability[];
  datasheetSlug?: string;
}

// The main roster object that represents a user's army list.
export interface Roster {
  id: string; // A unique ID for this roster
  name: string;
  factionId: string;
  factionSlug?: string;
  faction?: Index; // Faction metadata from the index (name, path, counts, etc.)
  detachment: Detachment;
  points: {
    current: number;
    max: number;
  };
  warlordUnitId?: string | null;
  units: RosterUnit[];
  enhancements: { enhancement: Enhancement; unitId: string }[]; // Applied enhancements linked to a unit
}

export type CollectionUnitState = 'sprue' | 'built' | 'battle-ready' | 'parade-ready';

export interface CollectionUnit {
  id: string;
  datasheet: Datasheet;
  modelCost: ModelCost;
  selectedWargear: Wargear[];
  selectedWargearAbilities?: Ability[];
  state: CollectionUnitState;
  datasheetSlug?: string;
}

export interface Collection {
  id: string;
  name: string;
  factionId: string;
  factionSlug?: string;
  faction?: Index;
  items: CollectionUnit[];
  points: {
    current: number;
  };
}
