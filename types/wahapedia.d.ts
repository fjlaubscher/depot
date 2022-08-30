declare namespace Wahapedia {
  interface Keyword {
    datasheet_id: string;
    keyword: string;
    model: string;
    is_faction_keyword: string;
    active: boolean;
  }

  interface DatasheetProfile {
    datasheet_id: string;
    line: string;
    name: string;
    M: string;
    WS: string;
    BS: string;
    S: string;
    T: string;
    W: string;
    A: string;
    Ld: string;
    Sv: string;
    Cost: string;
    cost_description: string;
    models_per_unit: string;
    cost_including_wargear: string;
    base_size: string;
    base_size_descr: string;
    active: boolean;
  }

  interface WargearProfile {
    wargear_id: string;
    line: string;
    name: string;
    Range: string;
    type: string;
    S: string;
    AP: string;
    D: string;
    abilities: string;
  }

  interface Wargear {
    id: string;
    name: string;
    type: string;
    description: string;
    source_id: string;
    is_relic: string;
    faction_id: string;
    faction_name: string;
    legend: string;
    active: boolean;
    profiles: WargearProfile[];
  }

  interface Ability {
    id: string;
    type: string;
    name: string;
    legend: string;
    is_other_wargear: string;
    faction_id: string;
    description: string;
    showDescription: boolean;
    showAbility: boolean;
  }

  interface Datasheet {
    id: string;
    name: string;
    link: string;
    faction_id: string;
    source_id: string;
    role: string;
    unit_composition: string;
    transport: string;
    power_points: string;
    priest: string;
    psyker: string;
    open_play_only: string;
    cursade_only: string;
    virtual: string;
    Cost: string;
    cost_per_unit: string;
    cardType: string;
    source: string;
    keywords: Keyword[];
    datasheet: DatasheetProfile[];
    wargear: Wargear[];
    abilities: Ability[];
  }

  interface Stratagem {
    faction_id: string;
    name: string;
    type: string;
    cp_cost: string;
    legend: string;
    source_id: string;
    description: string;
    id: string;
    cardType: string;
    source: string;
  }

  interface Faction {
    id: string;
    name: string;
    link: string;
    datasheets: Datasheet[];
    stratagems: Stratagem[];
  }

  interface Data {
    data: Faction[];
    version: string;
  }
}
