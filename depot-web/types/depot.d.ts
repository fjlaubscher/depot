declare namespace depot {
  interface Ability {
    id: string;
    type: string;
    name: string;
    legend: string;
    isOtherWargear: string;
    factionId: string;
    description: string;
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

  interface Keyword {
    datasheetId: string;
    keyword: string;
    model: string;
    isFactionKeyword: string;
  }

  interface Model {
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

  interface Relic {
    id: string;
    name: string;
    type: string;
    description: string;
    sourceId: string;
    isRelic: string;
    factionId: string;
    factionName: string;
    legend: string;
    profiles: WargearProfile[];
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
    phases: string[];
  }

  interface WargearProfile {
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
    profiles: WargearProfile[];
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
    abilities: Ability[];
    damage: DatasheetDamage[];
    keywords: Keyword[];
    models: Model[];
    options: DatasheetOption[];
    stratagems: Stratagem[];
    wargear: Wargear[];
    isForgeWorld: boolean;
    isLegends: boolean;
  }

  interface Faction {
    id: string;
    name: string;
    link: string;
    isSubfaction: string;
    parentId: string;
    datasheets: Datasheet[];
    psychicPowers: PsychicPower[];
    relics: Relic[];
    stratagems: Stratagem[];
    warlordTraits: WarlordTrait[];
  }

  interface Index {
    id: string;
    name: string;
    path: string;
  }

  interface Settings {
    showForgeWorld?: boolean;
    showLegends?: boolean;
  }
}
