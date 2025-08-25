import { readFileSync } from 'fs';
import { depot, wahapedia } from 'depot-core';

const JSON_DIR = `${__dirname}/json`;

const readFileAndParseToJSON = <T>(fileName: string): T[] =>
  JSON.parse(readFileSync(`${JSON_DIR}/${fileName}`, { encoding: 'utf-8' }));

const consolidateFiles = (): wahapedia.Data => {
  const abilities = readFileAndParseToJSON<wahapedia.Ability>('abilities.json');

  const datasheets = readFileAndParseToJSON<wahapedia.Datasheet>('datasheets.json');
  const datasheetAbilities = readFileAndParseToJSON<wahapedia.DatasheetAbility>(
    'datasheets-abilities.json'
  );
  const datasheetDamage =
    readFileAndParseToJSON<wahapedia.DatasheetDamage>('datasheets-damage.json');
  const datasheetKeywords = readFileAndParseToJSON<wahapedia.DatasheetKeyword>(
    'datasheets-keywords.json'
  );
  const datasheetModels =
    readFileAndParseToJSON<wahapedia.DatasheetModel>('datasheets-models.json');
  const datasheetOptions =
    readFileAndParseToJSON<wahapedia.DatasheetOption>('datasheets-options.json');
  const datasheetStratagems = readFileAndParseToJSON<wahapedia.DatasheetStratagem>(
    'datasheets-stratagems.json'
  );
  const datasheetWargear =
    readFileAndParseToJSON<wahapedia.DatasheetWargear>('datasheets-wargear.json');

  const factions = readFileAndParseToJSON<wahapedia.Faction>('factions.json');

  const psychicPowers = readFileAndParseToJSON<wahapedia.PsychicPower>('psychicpowers.json');

  const sources = readFileAndParseToJSON<wahapedia.Source>('source.json');

  const stratagems = readFileAndParseToJSON<wahapedia.Stratagem>('stratagems.json');
  const stratagemPhases = readFileAndParseToJSON<wahapedia.StratagemPhase>('stratagemphases.json');

  const wargear = readFileAndParseToJSON<wahapedia.Wargear>('wargear.json');
  const wargearList = readFileAndParseToJSON<wahapedia.WargearList>('wargear-list.json');

  const warlordTraits = readFileAndParseToJSON<wahapedia.WarlordTrait>('warlord-traits.json');

  return {
    abilities,
    datasheets,
    datasheetAbilities,
    datasheetDamage,
    datasheetKeywords,
    datasheetModels,
    datasheetOptions,
    datasheetStratagems,
    datasheetWargear,
    factions,
    psychicPowers,
    sources,
    stratagems,
    stratagemPhases,
    wargear,
    wargearList,
    warlordTraits
  };
};

const buildStratagem = (data: wahapedia.Data, stratagemId: string): depot.Stratagem => {
  const stratagem = data.stratagems.filter((s) => s.id === stratagemId)[0];
  const phases = data.stratagemPhases
    .filter((phase) => phase.stratagemId === stratagemId)
    .map((phase) => phase.phase);

  return {
    ...stratagem,
    phases
  };
};

const buildDatasheet = (data: wahapedia.Data, datasheet: wahapedia.Datasheet): depot.Datasheet => {
  const abilities = data.datasheetAbilities
    .filter((ability) => ability.datasheetId === datasheet.id)
    .map((a) => {
      return data.abilities.filter((ability) => ability.id === a.abilityId)[0];
    });

  const damage = data.datasheetDamage.filter((damage) => damage.datasheetId === datasheet.id);

  const isForgeWorld = data.sources
    .filter((s) => s.name.includes('Forge World:') || s.name.includes('Imperial Armour:'))
    .map((s) => s.id)
    .includes(datasheet.sourceId);

  const isLegends = data.sources
    .filter((s) => s.name.includes('Warhammer Legends:'))
    .map((s) => s.id)
    .includes(datasheet.sourceId);

  const keywords = data.datasheetKeywords.filter((keyword) => keyword.datasheetId === datasheet.id);
  const models = data.datasheetModels.filter((model) => model.datasheetId === datasheet.id);
  const options = data.datasheetOptions.filter((option) => option.datasheetId === datasheet.id);

  const stratagems = data.datasheetStratagems
    .filter((ds) => ds.datasheetId === datasheet.id)
    .map((ds) => buildStratagem(data, ds.stratagemId));

  const wargearIds = data.datasheetWargear
    .filter((wargear) => wargear.datasheetId === datasheet.id)
    .map((wargear) => wargear.wargearId)
    .filter((id, i, self) => self.indexOf(id) === i);

  const wargear: depot.Wargear[] = [];
  for (let i = 0; i < wargearIds.length; i++) {
    const wargearId = wargearIds[i];
    const gear = data.wargear.filter((wg) => wg.id === wargearId)[0];
    const profiles = data.wargearList.filter((item) => item.wargearId === wargearId);

    wargear.push({ ...gear, profiles });
  }

  return {
    ...datasheet,
    abilities,
    damage,
    keywords,
    models,
    options,
    stratagems,
    wargear,
    isForgeWorld,
    isLegends
  };
};

const buildFactionData = (data: wahapedia.Data, faction: wahapedia.Faction): depot.Faction => {
  const datasheets = data.datasheets
    .filter((datasheet) => datasheet.factionId === faction.id)
    .map((datasheet) => buildDatasheet(data, datasheet));

  const psychicPowers = data.psychicPowers.filter(
    (psychicPower) => psychicPower.factionId === faction.id
  );

  const relics = data.wargear
    .filter((w) => w.factionId === faction.id && w.isRelic === 'true')
    .map(
      (relic) =>
        ({
          ...relic,
          profiles: data.wargearList.filter((item) => item.wargearId === relic.id)
        } as depot.Relic)
    );

  const stratagems = data.stratagems
    .filter((strat) => strat.factionId === faction.id)
    .map((strat) => buildStratagem(data, strat.id));

  const warlordTraits = data.warlordTraits.filter((wlt) => wlt.factionId === faction.id);

  return {
    ...faction,
    datasheets,
    psychicPowers,
    relics,
    stratagems,
    warlordTraits
  };
};

const generateData = () => {
  const data = consolidateFiles();

  return data.factions
    .map((f) => buildFactionData(data, f));
};

export default generateData;
