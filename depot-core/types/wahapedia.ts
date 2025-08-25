export interface Ability {
  id: string;
  type: string;
  name: string;
  legend: string;
  isOtherWargear: string;
  factionId: string;
  description: string;
}

export interface Datasheet {
  id: string;
  name: string;
  link: string;
  factionId: string;
  sourceId: string;
  role: string;
  unitComposition: string;
  transport: string;
  powerPoints: string;
  priest: string;
  psyker: string;
  openPlayOnly: string;
  crusadeOnly: string;
  virtual: string;
  cost: string;
  costPerUnit: string;
}

export interface DatasheetDamage {
  datasheetId: string;
  line: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
}

export interface DatasheetKeyword {
  datasheetId: string;
  keyword: string;
  model: string;
  isFactionKeyword: string;
}

export interface DatasheetAbility {
  datasheetId: string;
  line: string;
  abilityId: string;
  isIndexWargear: string;
  cost: string;
  model: string;
}

export interface DatasheetModel {
  datasheetId: string;
  line: string;
  name: string;
  m: string;
  ws: string;
  bs: string;
  s: string;
  t: string;
  w: string;
  a: string;
  ld: string;
  sv: string;
  cost: string;
  costDescription: string;
  modelsPerUnit: string;
  costIncludingWargear: string;
  baseSize: string;
  baseSizeDescr: string;
}

export interface DatasheetOption {
  datasheetId: string;
  line: string;
  button: string;
  description: string;
  isIndexWargear: string;
}

export interface DatasheetStratagem {
  datasheetId: string;
  stratagemId: string;
}

export interface DatasheetWargear {
  datasheetId: string;
  line: string;
  wargearId: string;
  cost: string;
  isIndexWargear: string;
  model: string;
  isUpgrade: string;
}

export interface Faction {
  id: string;
  name: string;
  link: string;
}

export interface PsychicPower {
  roll: string;
  name: string;
  factionId: string;
  factionName: string;
  legend: string;
  type: string;
  description: string;
  id: string;
}

export interface Stratagem {
  factionId: string;
  name: string;
  type: string;
  cpCost: string;
  legend: string;
  sourceId: string;
  subfactionId: string;
  description: string;
  id: string;
}

export interface StratagemPhase {
  stratagemId: string;
  phase: string;
}

export interface Wargear {
  id: string;
  name: string;
  type: string;
  description: string;
  sourceId: string;
  isRelic: string;
  factionId: string;
  factionName: string;
  legend: string;
}

export interface WargearList {
  wargearId: string;
  line: string;
  name: string;
  range: string;
  type: string;
  s: string;
  ap: string;
  d: string;
  abilities: string;
}

export interface WarlordTrait {
  factionId: string;
  factionName: string;
  type: string;
  roll: string;
  name: string;
  legend: string;
  description: string;
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

export interface Data {
  abilities: Ability[];
  datasheets: Datasheet[];
  datasheetAbilities: DatasheetAbility[];
  datasheetDamage: DatasheetDamage[];
  datasheetKeywords: DatasheetKeyword[];
  datasheetModels: DatasheetModel[];
  datasheetOptions: DatasheetOption[];
  datasheetStratagems: DatasheetStratagem[];
  datasheetWargear: DatasheetWargear[];
  factions: Faction[];
  psychicPowers: PsychicPower[];
  sources: Source[];
  stratagems: Stratagem[];
  stratagemPhases: StratagemPhase[];
  wargear: Wargear[];
  wargearList: WargearList[];
  warlordTraits: WarlordTrait[];
}