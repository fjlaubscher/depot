declare namespace Wahapedia {
  interface Ability {
    id: string;
    type: string;
    name: string;
    legend: string;
    isOtherWargear: string;
    factionId: string;
    description: string;
  }

  interface Datasheet {
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

  interface DatasheetDamage {
    datasheetId: string;
    line: string;
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
  }

  interface DatasheetKeyword {
    datasheetId: string;
    keyword: string;
    model: string;
    isFactionKeyword: string;
  }

  interface DatasheetAbility {
    datasheetId: string;
    line: string;
    abilityId: string;
    isIndexWargear: string;
    cost: string;
    model: string;
  }

  interface DatasheetModel {
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

  interface DatasheetOption {
    datasheetId: string;
    line: string;
    button: string;
    description: string;
    isIndexWargear: string;
  }

  interface DatasheetStratagem {
    datasheetId: string;
    stratagemId: string;
  }

  interface DatasheetWargear {
    datasheetId: string;
    line: string;
    wargearId: string;
    cost: string;
    isIndexWargear: string;
    model: string;
    isUpgrade: string;
  }

  interface Faction {
    id: string;
    name: string;
    link: string;
    isSubfaction: string;
    parentId: string;
  }

  interface PsychicPower {
    roll: string;
    name: string;
    factionId: string;
    factionName: string;
    legend: string;
    type: string;
    description: string;
    id: string;
  }

  interface Stratagem {
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

  interface StratagemPhase {
    stratagemId: string;
    phase: string;
  }

  interface Wargear {
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

  interface WargearList {
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

  interface WarlordTrait {
    factionId: string;
    factionName: string;
    type: string;
    roll: string;
    name: string;
    legend: string;
    description: string;
  }

  interface Source {
    id: string;
    name: string;
    type: string;
    edition: string;
    version: string;
    errataDate: string;
    errataLink: string;
  }

  interface Data {
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
}
