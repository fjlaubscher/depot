export interface Faction {
  id: string;
  name: string;
  link: string;
}

export interface Source {
  id: string;
  name: string;
  type: string;
  edition: string;
  version: string;
  errataDate: string;
  errataLink: string;
}

export interface Datasheet {
  id: string;
  name: string;
  factionId: string;
  sourceId: string;
  legend: string;
  role: string;
  loadout: string;
  transport: string;
  virtual: string;
  leaderHead: string;
  leaderFooter: string;
  damagedW: string;
  damagedDescription: string;
  link: string;
}

export interface DatasheetAbility {
  datasheetId: string;
  line: string;
  abilityId: string;
  model: string;
  name: string;
  description: string;
  type: string;
  parameter: string;
}

export interface DatasheetKeyword {
  datasheetId: string;
  keyword: string;
  model: string;
  isFactionKeyword: string;
}

export interface DatasheetModel {
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

export interface DatasheetWargear {
  datasheetId: string;
  line: string;
  lineInWargear: string;
  dice: string;
  name: string;
  description: string;
  range: string;
  type: 'Ranged' | 'Melee';
  a: string;
  bsWs: string;
  s: string;
  ap: string;
  d: string;
}

export interface DatasheetUnitComposition {
  datasheetId: string;
  line: string;
  description: string;
}

export interface DatasheetModelCost {
  datasheetId: string;
  line: string;
  description: string;
  cost: string;
}

export interface DatasheetStratagem {
  datasheetId: string;
  stratagemId: string;
}

export interface DatasheetEnhancement {
  datasheetId: string;
  enhancementId: string;
}

export interface DatasheetDetachmentAbility {
  datasheetId: string;
  detachmentAbilityId: string;
}

export interface DatasheetLeader {
  datasheetId: string;
  attachedDatasheetId: string;
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

export interface Ability {
  id: string;
  name: string;
  legend: string;
  factionId: string;
  description: string;
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

export interface Data {
  factions: Faction[];
  sources: Source[];
  datasheets: Datasheet[];
  datasheetAbilities: DatasheetAbility[];
  datasheetKeywords: DatasheetKeyword[];
  datasheetModels: DatasheetModel[];
  datasheetOptions: DatasheetOption[];
  datasheetWargear: DatasheetWargear[];
  datasheetUnitComposition: DatasheetUnitComposition[];
  datasheetModelCosts: DatasheetModelCost[];
  datasheetStratagems: DatasheetStratagem[];
  datasheetEnhancements: DatasheetEnhancement[];
  datasheetDetachmentAbilities: DatasheetDetachmentAbility[];
  datasheetLeaders: DatasheetLeader[];
  stratagems: Stratagem[];
  abilities: Ability[];
  enhancements: Enhancement[];
  detachmentAbilities: DetachmentAbility[];
}
