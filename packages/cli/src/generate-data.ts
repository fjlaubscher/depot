import { readFileSync } from 'fs';
import { depot, wahapedia } from '@depot/core';

const JSON_DIR = `${__dirname}/json`;

const readFileAndParseToJSON = <T>(fileName: string): T[] =>
  JSON.parse(readFileSync(`${JSON_DIR}/${fileName}`, { encoding: 'utf-8' }));

const consolidateFiles = (): wahapedia.Data => {
  const factions = readFileAndParseToJSON<wahapedia.Faction>('factions.json');
  const sources = readFileAndParseToJSON<wahapedia.Source>('source.json');

  const datasheets = readFileAndParseToJSON<wahapedia.Datasheet>('datasheets.json');
  const datasheetAbilities = readFileAndParseToJSON<wahapedia.DatasheetAbility>(
    'datasheets-abilities.json'
  );
  const datasheetKeywords = readFileAndParseToJSON<wahapedia.DatasheetKeyword>(
    'datasheets-keywords.json'
  );
  const datasheetModels =
    readFileAndParseToJSON<wahapedia.DatasheetModel>('datasheets-models.json');
  const datasheetOptions =
    readFileAndParseToJSON<wahapedia.DatasheetOption>('datasheets-options.json');
  const datasheetWargear =
    readFileAndParseToJSON<wahapedia.DatasheetWargear>('datasheets-wargear.json');
  const datasheetUnitComposition = readFileAndParseToJSON<wahapedia.DatasheetUnitComposition>(
    'datasheets-unit-composition.json'
  );
  const datasheetModelCosts = readFileAndParseToJSON<wahapedia.DatasheetModelCost>(
    'datasheets-models-cost.json'
  );
  const datasheetStratagems = readFileAndParseToJSON<wahapedia.DatasheetStratagem>(
    'datasheets-stratagems.json'
  );
  const datasheetEnhancements = readFileAndParseToJSON<wahapedia.DatasheetEnhancement>(
    'datasheets-enhancements.json'
  );
  const datasheetDetachmentAbilities = readFileAndParseToJSON<wahapedia.DatasheetDetachmentAbility>(
    'datasheets-detachment-abilities.json'
  );
  const datasheetLeaders =
    readFileAndParseToJSON<wahapedia.DatasheetLeader>('datasheets-leader.json');
  const stratagems = readFileAndParseToJSON<wahapedia.Stratagem>('stratagems.json');
  const abilities = readFileAndParseToJSON<wahapedia.Ability>('abilities.json');
  const enhancements = readFileAndParseToJSON<wahapedia.Enhancement>('enhancements.json');
  const detachmentAbilities = readFileAndParseToJSON<wahapedia.DetachmentAbility>(
    'detachment-abilities.json'
  );

  return {
    factions,
    sources,
    datasheets,
    datasheetAbilities,
    datasheetKeywords,
    datasheetModels,
    datasheetOptions,
    datasheetWargear,
    datasheetUnitComposition,
    datasheetModelCosts,
    datasheetStratagems,
    datasheetEnhancements,
    datasheetDetachmentAbilities,
    datasheetLeaders,
    stratagems,
    abilities,
    enhancements,
    detachmentAbilities
  };
};

const buildDatasheet = (data: wahapedia.Data, datasheet: wahapedia.Datasheet): depot.Datasheet => {
  const abilities = data.datasheetAbilities
    .filter((ability) => ability.datasheetId === datasheet.id)
    .map((a) => {
      return data.abilities.filter((ability) => ability.id === a.abilityId)[0];
    });

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
  const wargear = data.datasheetWargear.filter((wargear) => wargear.datasheetId === datasheet.id);
  const unitComposition = data.datasheetUnitComposition.filter(
    (uc) => uc.datasheetId === datasheet.id
  );
  const modelCosts = data.datasheetModelCosts.filter((mc) => mc.datasheetId === datasheet.id);

  const stratagems = data.datasheetStratagems
    .filter((ds) => ds.datasheetId === datasheet.id)
    .map((ds) => data.stratagems.filter((s) => s.id === ds.stratagemId)[0]);

  const enhancements = data.datasheetEnhancements
    .filter((de) => de.datasheetId === datasheet.id)
    .map((de) => data.enhancements.filter((e) => e.id === de.enhancementId)[0]);

  const detachmentAbilities = data.datasheetDetachmentAbilities
    .filter((dda) => dda.datasheetId === datasheet.id)
    .map((dda) => data.detachmentAbilities.filter((da) => da.id === dda.detachmentAbilityId)[0]);

  const leaders = data.datasheetLeaders
    .filter((dl) => dl.datasheetId === datasheet.id)
    .map((dl) => dl.attachedDatasheetId);

  return {
    ...datasheet,
    abilities,
    keywords,
    models,
    options,
    wargear,
    unitComposition,
    modelCosts,
    stratagems,
    enhancements,
    detachmentAbilities,
    leaders,
    isForgeWorld,
    isLegends
  };
};

const buildFactionData = (data: wahapedia.Data, faction: wahapedia.Faction): depot.Faction => {
  const datasheets = data.datasheets
    .filter((datasheet) => datasheet.factionId === faction.id)
    .map((datasheet) => buildDatasheet(data, datasheet));

  const stratagems = data.stratagems.filter((strat) => strat.factionId === faction.id);
  const enhancements = data.enhancements.filter(
    (enhancement) => enhancement.factionId === faction.id
  );
  const detachmentAbilities = data.detachmentAbilities.filter((da) => da.factionId === faction.id);

  return {
    ...faction,
    datasheets,
    stratagems,
    enhancements,
    detachmentAbilities
  };
};

const generateData = () => {
  const data = consolidateFiles();

  return data.factions.map((f) => buildFactionData(data, f));
};

export default generateData;
