import type * as wahapedia from './wahapedia.js';

export interface Ability {
  id: string;
  name: string;
  legend: string;
  factionId: string;
  description: string;
  type: string;
  parameter?: string;
}

export type Keyword = wahapedia.DatasheetKeyword;
export type Model = wahapedia.DatasheetModel;
export type DatasheetOption = wahapedia.DatasheetOption;

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

export type UnitComposition = wahapedia.DatasheetUnitComposition;

export interface ModelCost {
  datasheetId: string;
  line: string;
  description: string;
  cost: string;
  /** Preceding cost-bracket header, e.g. `YOUR 1ST TO 3RD UNITS COST`. */
  section?: string;
}

export interface Enhancement {
  id: string;
  factionId: string;
  name: string;
  legend: string;
  description: string;
  cost: string;
  detachment: string;
  upgrade?: boolean;
  supportLeader?: string;
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
  sourceName?: string;
  /**
   * Normalized supplement identifier (lowercase). Defaults to 'codex' when absent.
   */
  supplementKey?: string;
  supplementSlug?: string;
  supplementName?: string;
  /**
   * Prebuilt, user-facing supplement label (e.g. 'Blood Angels', 'None').
   */
  supplementLabel?: string;
  /**
   * True when the datasheet belongs to a supplement (i.e. not the core codex).
   */
  isSupplement?: boolean;
  legend: string;
  isSupport: boolean;
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
  /** Stratagems this unit can use; the text lives on the faction detachments. */
  stratagemIds: string[];
  leaders: DatasheetLeaderReference[];
  isForgeWorld: boolean;
  isLegends: boolean;
}

/** Grouping bucket for a datasheet; derived from its keywords. */
export type BattlefieldRole = 'epic-hero' | 'character' | 'battleline' | 'other';

export interface DatasheetSummary {
  id: string;
  slug: string;
  name: string;
  factionId: string;
  factionSlug: string;
  dataVersion?: string;
  isSupport: boolean;
  /**
   * Precomputed so faction lists can group and price without loading every
   * datasheet. Optional: manifests generated before these existed lack them.
   */
  role?: BattlefieldRole;
  /** Cheapest cost, `+` suffixed when the sheet has more than one price. */
  points?: string | null;
  path: string;
  supplementKey?: string;
  supplementSlug?: string;
  supplementName?: string;
  supplementLabel?: string;
  isSupplement?: boolean;
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
  dataVersion?: string;
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
  dataVersion?: string;
  datasheetCount?: number;
  detachmentCount?: number;
}

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  showForgeWorld?: boolean;
  showLegends?: boolean;
  showUnaligned?: boolean;
  showFluff?: boolean;
  includeWargearOnExport?: boolean;
  useNativeShare?: boolean;
  theme?: Theme;
}

export interface Detachment {
  id: string;
  slug: string;
  name: string;
  legend: string;
  type: string;
  dp: string;
  forceDisposition: string;
  chapterDp: { keyword: string; dp: string }[];
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
  dataVersion?: string | null;
  /** Selected detachments; their combined DP is capped by battle size (core rules 25.03). */
  detachments: Detachment[];
  /** @deprecated Pre-11th single-detachment saves. Read via `getRosterDetachments`. */
  detachment?: Detachment;
  points: {
    current: number;
    max: number;
  };
  warlordUnitId?: string | null;
  units: RosterUnit[];
  enhancements: { enhancement: Enhancement; unitId: string }[]; // Applied enhancements linked to a unit
  /**
   * Optional cabinet this list is attached to. Null/absent = theorycraft or
   * legacy list (club night, proxy, opponent). Set when created from a collection.
   */
  collectionId?: string | null;
  /** ISO timestamp when the roster was first created (optional for legacy saves). */
  createdAt?: string;
  /** ISO timestamp of the last local save (used for recent sorting). */
  updatedAt?: string;
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
  dataVersion?: string | null;
  items: CollectionUnit[];
  points: {
    current: number;
  };
  /** ISO timestamp when the collection was first created (optional for legacy saves). */
  createdAt?: string;
  /** ISO timestamp of the last local save (used for recent sorting). */
  updatedAt?: string;
}

/** User-pinned faction, datasheet or detachment for the home dashboard. */
export type Bookmark =
  | {
      id: string;
      kind: 'faction';
      factionSlug: string;
      name: string;
      createdAt: string;
    }
  | {
      id: string;
      kind: 'datasheet';
      factionSlug: string;
      datasheetSlug: string;
      name: string;
      factionName?: string;
      createdAt: string;
    }
  | {
      id: string;
      kind: 'detachment';
      factionSlug: string;
      detachmentSlug: string;
      name: string;
      factionName?: string;
      createdAt: string;
    };

/**
 * Saved rosters/collections keep identity + user choices only; the catalog data
 * is rehydrated from local game data on load. Legacy saves that still embed a
 * full datasheet satisfy these shapes structurally, so they keep loading.
 */
export type DatasheetRef = Pick<Datasheet, 'id' | 'slug' | 'name' | 'factionSlug'>;
export type WargearRef = Pick<Wargear, 'id' | 'name'>;
export type AbilityRef = Pick<Ability, 'id' | 'name' | 'type' | 'parameter'>;
export type DetachmentRef = Pick<Detachment, 'id' | 'slug' | 'name'>;
/** `cost` is kept so points survive a datasheet that no longer resolves. */
export type EnhancementRef = Pick<Enhancement, 'id' | 'name' | 'cost' | 'detachment'>;

export interface StoredUnit {
  id: string;
  datasheet: DatasheetRef;
  datasheetSlug?: string;
  modelCost: ModelCost;
  selectedWargear: WargearRef[];
  selectedWargearAbilities?: AbilityRef[];
}

export type StoredRosterUnit = StoredUnit;
export type StoredCollectionUnit = StoredUnit & { state: CollectionUnitState };

export type StoredRoster = Omit<Roster, 'units' | 'detachments' | 'detachment' | 'enhancements'> & {
  units: StoredRosterUnit[];
  detachments: DetachmentRef[];
  detachment?: DetachmentRef;
  enhancements: { enhancement: EnhancementRef; unitId: string }[];
};

export type StoredCollection = Omit<Collection, 'items'> & {
  items: StoredCollectionUnit[];
};
