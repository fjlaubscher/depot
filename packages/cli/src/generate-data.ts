import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  detachments as detachmentUtils,
  slug as slugUtils,
  wargear as wargearUtils
} from '@depot/core';
import { sortByName } from '@depot/core/utils/common';
import { normalizeModelCosts } from '@depot/core/utils/model-costs';
import type { wahapedia, depot } from '@depot/core';
import { getSupplementInfo } from './config/supplements.js';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = join(PKG_ROOT, 'dist');
const JSON_DIR = join(DIST_DIR, 'json');
const CODEX_SLUG = 'codex';

const readFileAndParseToJSON = <T>(fileName: string): T[] =>
  JSON.parse(readFileSync(join(JSON_DIR, fileName), { encoding: 'utf-8' }));

const DATA_FILES: Record<keyof Omit<wahapedia.Data, 'lastUpdate'>, string> = {
  factions: 'factions.json',
  sources: 'source.json',
  datasheets: 'datasheets.json',
  datasheetAbilities: 'datasheets-abilities.json',
  datasheetKeywords: 'datasheets-keywords.json',
  datasheetModels: 'datasheets-models.json',
  datasheetOptions: 'datasheets-options.json',
  datasheetWargear: 'datasheets-wargear.json',
  datasheetUnitComposition: 'datasheets-unit-composition.json',
  datasheetModelCosts: 'datasheets-models-cost.json',
  datasheetStratagems: 'datasheets-stratagems.json',
  datasheetEnhancements: 'datasheets-enhancements.json',
  datasheetDetachmentAbilities: 'datasheets-detachment-abilities.json',
  datasheetLeaders: 'datasheets-leader.json',
  stratagems: 'stratagems.json',
  abilities: 'abilities.json',
  enhancements: 'enhancements.json',
  detachmentAbilities: 'detachment-abilities.json',
  detachments: 'detachments.json',
  detachmentChapterDp: 'detachments-chapter-dp.json'
};

const consolidateFiles = (): wahapedia.Data => {
  const tables = Object.fromEntries(
    Object.entries(DATA_FILES).map(([key, fileName]) => [key, readFileAndParseToJSON(fileName)])
  ) as Omit<wahapedia.Data, 'lastUpdate'>;

  return {
    ...tables,
    lastUpdate:
      readFileAndParseToJSON<wahapedia.LastUpdate>('last-update.json')[0]?.lastUpdate ?? null
  };
};

const buildDatasheet = (
  data: wahapedia.Data,
  datasheet: wahapedia.Datasheet,
  datasheetSlugs: Map<string, string>,
  factionSlugs: Map<string, string>
): depot.Datasheet => {
  const abilities: depot.Ability[] = data.datasheetAbilities
    .filter((ability: wahapedia.DatasheetAbility) => ability.datasheetId === datasheet.id)
    .map((a: wahapedia.DatasheetAbility): depot.Ability | undefined => {
      // If ability has an abilityId, look it up in the abilities table
      if (a.abilityId) {
        const referencedAbility = data.abilities.find(
          (ability: wahapedia.Ability) => ability.id === a.abilityId
        );
        if (referencedAbility) {
          return {
            ...referencedAbility,
            type: a.type, // Add the type from the datasheet-abilities data
            parameter: a.parameter || referencedAbility.parameter
          };
        }
        return undefined;
      }
      // If no abilityId but has name, use the inline ability data
      else if (a.name) {
        return {
          id: '', // inline abilities don't have IDs
          name: a.name,
          legend: '', // inline abilities don't have legends
          factionId: '', // inline abilities don't have factionIds
          description: a.description,
          type: a.type, // Add the type from the datasheet-abilities data
          parameter: a.parameter
        };
      }
      // Skip empty entries
      return undefined;
    })
    .filter((ability): ability is depot.Ability => ability !== undefined);

  const source = data.sources.find((entry) => entry.id === datasheet.sourceId);
  const sourceName = source?.name.trim() ?? '';
  const isForgeWorld = sourceName.endsWith('(Forge World)');
  const isLegends = sourceName.endsWith('(Warhammer Legends)') || sourceName.startsWith('Legends:');

  const supplementInfo = getSupplementInfo(datasheet.sourceId);
  const supplementKey = supplementInfo?.slug ?? CODEX_SLUG;
  const isSupplement = supplementKey !== CODEX_SLUG;
  const supplementLabel = isSupplement && supplementInfo ? supplementInfo.name : 'None';

  const keywords = data.datasheetKeywords.filter(
    (keyword: wahapedia.DatasheetKeyword) => keyword.datasheetId === datasheet.id
  );
  const models = data.datasheetModels.filter(
    (model: wahapedia.DatasheetModel) => model.datasheetId === datasheet.id
  );
  const options = data.datasheetOptions.filter(
    (option: wahapedia.DatasheetOption) => option.datasheetId === datasheet.id
  );
  const rawWargear = data.datasheetWargear.filter(
    (wargear: wahapedia.DatasheetWargear) => wargear.datasheetId === datasheet.id
  );
  const unitComposition = data.datasheetUnitComposition.filter(
    (uc: wahapedia.DatasheetUnitComposition) => uc.datasheetId === datasheet.id
  );
  const modelCosts = normalizeModelCosts(
    data.datasheetModelCosts.filter(
      (mc: wahapedia.DatasheetModelCost) => mc.datasheetId === datasheet.id
    )
  );

  const stratagems = data.datasheetStratagems
    .filter((ds: wahapedia.DatasheetStratagem) => ds.datasheetId === datasheet.id)
    .map((ds: wahapedia.DatasheetStratagem) =>
      data.stratagems.find((s: wahapedia.Stratagem) => s.id === ds.stratagemId)!
    );

  const enhancements = data.datasheetEnhancements
    .filter((de: wahapedia.DatasheetEnhancement) => de.datasheetId === datasheet.id)
    .map((de: wahapedia.DatasheetEnhancement) =>
      data.enhancements.find((e: wahapedia.Enhancement) => e.id === de.enhancementId)
    )
    .filter((enhancement): enhancement is wahapedia.Enhancement => Boolean(enhancement))
    .map(detachmentUtils.toDepotEnhancement);

  const detachmentAbilities = data.datasheetDetachmentAbilities
    .filter((dda: wahapedia.DatasheetDetachmentAbility) => dda.datasheetId === datasheet.id)
    .map((dda: wahapedia.DatasheetDetachmentAbility) =>
      data.detachmentAbilities.find(
        (da: wahapedia.DetachmentAbility) => da.id === dda.detachmentAbilityId
      )!
    );

  const leaders = data.datasheetLeaders
    .filter((dl: wahapedia.DatasheetLeader) => dl.leaderId === datasheet.id)
    .map((dl: wahapedia.DatasheetLeader) => ({
      id: dl.attachedId,
      slug: datasheetSlugs.get(dl.attachedId) ?? 'Unknown'
    }));

  const factionSlug = factionSlugs.get(datasheet.factionId);
  if (!factionSlug) {
    throw new Error(`Missing slug for faction ${datasheet.factionId}`);
  }

  const datasheetSlug = datasheetSlugs.get(datasheet.id);
  if (!datasheetSlug) {
    throw new Error(`Missing slug for datasheet ${datasheet.id}`);
  }

  const wargear = wargearUtils.groupWargearProfiles(rawWargear);

  return {
    id: datasheet.id,
    slug: datasheetSlug,
    name: datasheet.name,
    factionId: datasheet.factionId,
    factionSlug,
    sourceId: datasheet.sourceId,
    sourceName: source ? `${source.type}: ${source.name}` : undefined,
    supplementKey,
    supplementSlug: supplementInfo?.slug,
    supplementName: supplementInfo?.name,
    supplementLabel,
    isSupplement,
    legend: datasheet.legend,
    isSupport: datasheet.isSupport === 'true',
    loadout: datasheet.loadout,
    transport: datasheet.transport,
    virtual: datasheet.virtual === 'true',
    leaderHead: datasheet.leaderHead,
    leaderFooter: datasheet.leaderFooter,
    damagedW: datasheet.damagedW,
    damagedDescription: datasheet.damagedDescription,
    link: datasheet.link,
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

const buildCoreStratagems = (stratagems: wahapedia.Stratagem[]): depot.Stratagem[] => {
  const genericStratagems = stratagems.filter((stratagem) => !stratagem.factionId?.trim());
  return sortByName(genericStratagems);
};

const buildFactionData = (
  data: wahapedia.Data,
  faction: wahapedia.Faction,
  datasheetSlugs: Map<string, string>,
  factionSlugs: Map<string, string>
): depot.Faction => {
  const factionSlug = factionSlugs.get(faction.id);
  if (!factionSlug) {
    throw new Error(`Missing slug for faction ${faction.id}`);
  }

  const datasheets = sortByName(
    data.datasheets
      .filter((datasheet) => datasheet.factionId === faction.id && datasheet.virtual === 'false')
      .map((datasheet) => buildDatasheet(data, datasheet, datasheetSlugs, factionSlugs))
  );

  const stratagems = data.stratagems.filter((strat) => strat.factionId === faction.id);
  const enhancements = data.enhancements.filter(
    (enhancement) => enhancement.factionId === faction.id
  );
  const detachmentAbilities = data.detachmentAbilities.filter((da) => da.factionId === faction.id);
  const detachmentSlugGenerator = slugUtils.createSlugGenerator(`${factionSlug}-detachment`);
  const detachments = detachmentUtils.buildFactionDetachments({
    factionId: faction.id,
    detachments: data.detachments,
    chapterDp: data.detachmentChapterDp,
    abilities: detachmentAbilities,
    enhancements,
    stratagems,
    createSlug: detachmentSlugGenerator
  });

  return {
    ...faction,
    slug: factionSlug,
    datasheets,
    detachments
  };
};

const generateData = () => {
  const data = consolidateFiles();
  const dataVersion = data.lastUpdate ?? null;

  const factionSlugGenerator = slugUtils.createSlugGenerator('faction');
  const datasheetSlugGenerator = slugUtils.createSlugGenerator('datasheet');
  const factionSlugs = new Map<string, string>();
  const datasheetSlugs = new Map<string, string>();

  data.factions.forEach((faction) => {
    factionSlugs.set(faction.id, factionSlugGenerator(faction.name));
  });

  data.datasheets.forEach((datasheet) => {
    datasheetSlugs.set(datasheet.id, datasheetSlugGenerator(datasheet.name));
  });

  const factions = data.factions.map((f) =>
    buildFactionData(data, f, datasheetSlugs, factionSlugs)
  );
  const coreStratagems = buildCoreStratagems(data.stratagems);

  return { factions, coreStratagems, dataVersion };
};

export default generateData;
