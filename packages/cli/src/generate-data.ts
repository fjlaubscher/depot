import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { slug as slugUtils, wargear as wargearUtils } from '@depot/core';
import type { wahapedia, depot } from '@depot/core';
import { buildSourceClassifier } from './utils/source-classification.js';
import type { SourceClassifier } from './utils/source-classification.js';
import { getSupplementInfo } from './config/supplements.js';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = join(PKG_ROOT, 'dist');
const JSON_DIR = join(DIST_DIR, 'json');
const CODEX_SLUG = 'codex';

const readFileAndParseToJSON = <T>(fileName: string): T[] =>
  JSON.parse(readFileSync(join(JSON_DIR, fileName), { encoding: 'utf-8' }));

const normalizeSupplementKey = (value?: string) => (value ?? CODEX_SLUG).toLowerCase();

const toTitleCase = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const buildSupplementLabel = (slug?: string, name?: string) => {
  const normalizedSlug = normalizeSupplementKey(slug);
  if (normalizedSlug === CODEX_SLUG) {
    return 'None';
  }

  if (name) {
    return name;
  }

  return slug ? toTitleCase(slug) : 'Supplement';
};

const formatRoleLabel = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  return value
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ');
};

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

const buildDatasheet = (
  data: wahapedia.Data,
  datasheet: wahapedia.Datasheet,
  datasheetSlugs: Map<string, string>,
  factionSlugs: Map<string, string>,
  classifySource: SourceClassifier
): depot.Datasheet => {
  const abilities: depot.Ability[] = data.datasheetAbilities
    .filter((ability: wahapedia.DatasheetAbility) => ability.datasheetId === datasheet.id)
    .map((a: wahapedia.DatasheetAbility): depot.Ability | undefined => {
      // If ability has an abilityId, look it up in the abilities table
      if (a.abilityId) {
        const referencedAbility = data.abilities.filter(
          (ability: wahapedia.Ability) => ability.id === a.abilityId
        )[0];
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

  const { isForgeWorld, isLegends } = classifySource(datasheet.sourceId);
  const supplementInfo = getSupplementInfo(datasheet.factionId, datasheet.sourceId);
  const supplementKey = normalizeSupplementKey(supplementInfo?.slug);
  const supplementLabel = buildSupplementLabel(supplementInfo?.slug, supplementInfo?.name);
  const isSupplement = supplementKey !== CODEX_SLUG;
  const source = data.sources.find((entry) => entry.id === datasheet.sourceId);
  if (!source) {
    throw new Error(`Missing source for datasheet ${datasheet.id} (${datasheet.name})`);
  }

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
  const modelCosts = data.datasheetModelCosts.filter(
    (mc: wahapedia.DatasheetModelCost) => mc.datasheetId === datasheet.id
  );

  const stratagems = data.datasheetStratagems
    .filter((ds: wahapedia.DatasheetStratagem) => ds.datasheetId === datasheet.id)
    .map(
      (ds: wahapedia.DatasheetStratagem) =>
        data.stratagems.filter((s: wahapedia.Stratagem) => s.id === ds.stratagemId)[0]
    );

  const enhancements = data.datasheetEnhancements
    .filter((de: wahapedia.DatasheetEnhancement) => de.datasheetId === datasheet.id)
    .map(
      (de: wahapedia.DatasheetEnhancement) =>
        data.enhancements.filter((e: wahapedia.Enhancement) => e.id === de.enhancementId)[0]
    );

  const detachmentAbilities = data.datasheetDetachmentAbilities
    .filter((dda: wahapedia.DatasheetDetachmentAbility) => dda.datasheetId === datasheet.id)
    .map(
      (dda: wahapedia.DatasheetDetachmentAbility) =>
        data.detachmentAbilities.filter(
          (da: wahapedia.DetachmentAbility) => da.id === dda.detachmentAbilityId
        )[0]
    );

  const leaders = data.datasheetLeaders
    .filter((dl: wahapedia.DatasheetLeader) => dl.leaderId === datasheet.id)
    .map((dl: wahapedia.DatasheetLeader) => {
      const attachedUnitSlug = datasheetSlugs.get(dl.attachedId);
      return {
        id: dl.attachedId,
        slug: attachedUnitSlug ?? 'Unknown'
      };
    })
    .filter((leader): leader is depot.DatasheetLeaderReference => Boolean(leader));

  const factionSlug = factionSlugs.get(datasheet.factionId);
  if (!factionSlug) {
    throw new Error(`Missing slug for faction ${datasheet.factionId}`);
  }

  const datasheetSlug = datasheetSlugs.get(datasheet.id);
  if (!datasheetSlug) {
    throw new Error(`Missing slug for datasheet ${datasheet.id}`);
  }

  const wargearSlug = slugUtils.createSlugGenerator(`${datasheetSlug}-wargear`);
  const wargear = wargearUtils.groupWargearProfiles(rawWargear, {
    createId: ({ baseName, groupIndex }) => {
      const label = baseName || `wargear-${groupIndex + 1}`;
      return `${datasheet.id}:${wargearSlug(label)}`;
    }
  });

  return {
    ...datasheet,
    slug: datasheetSlug,
    factionSlug,
    virtual: datasheet.virtual === 'true',
    supplementKey,
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
    supplementSlug: supplementInfo?.slug,
    supplementName: supplementInfo?.name,
    supplementLabel,
    isSupplement,
    roleLabel: formatRoleLabel(datasheet.role) ?? datasheet.role,
    sourceName: `${source.type}: ${source.name}`,
    isForgeWorld,
    isLegends
  };
};

const sortByName = <T extends { name: string }>(items: T[]) =>
  items.sort((a, b) => a.name.localeCompare(b.name));

const buildDetachments = (
  detachmentAbilities: wahapedia.DetachmentAbility[],
  enhancements: wahapedia.Enhancement[],
  stratagems: wahapedia.Stratagem[],
  createSlug: (value: string) => string
): depot.Detachment[] => {
  const detachments = new Map<string, depot.Detachment>();

  const addToDetachment = (
    name: string,
    type: 'abilities' | 'enhancements' | 'stratagems',
    entry: wahapedia.DetachmentAbility | wahapedia.Enhancement | wahapedia.Stratagem
  ) => {
    if (!name) {
      return;
    }

    if (!detachments.has(name)) {
      detachments.set(name, {
        slug: createSlug(name),
        name,
        abilities: [],
        enhancements: [],
        stratagems: []
      });
    }

    const detachment = detachments.get(name);
    if (!detachment) {
      return;
    }

    detachment[type].push(entry as never);
  };

  detachmentAbilities.forEach((ability) =>
    addToDetachment(ability.detachment, 'abilities', ability)
  );
  enhancements.forEach((enhancement) =>
    addToDetachment(enhancement.detachment, 'enhancements', enhancement)
  );
  stratagems.forEach((stratagem) => addToDetachment(stratagem.detachment, 'stratagems', stratagem));

  const builtDetachments = Array.from(detachments.values());
  builtDetachments.forEach((detachment) => {
    sortByName(detachment.abilities);
    sortByName(detachment.enhancements);
    sortByName(detachment.stratagems);
  });

  return sortByName(builtDetachments);
};

const buildCoreStratagems = (stratagems: wahapedia.Stratagem[]): depot.Stratagem[] => {
  const genericStratagems = stratagems.filter((stratagem) => !stratagem.factionId?.trim());
  return sortByName(genericStratagems);
};

const buildFactionData = (
  data: wahapedia.Data,
  faction: wahapedia.Faction,
  datasheetSlugs: Map<string, string>,
  factionSlugs: Map<string, string>,
  classifySource: SourceClassifier
): depot.Faction => {
  const factionSlug = factionSlugs.get(faction.id);
  if (!factionSlug) {
    throw new Error(`Missing slug for faction ${faction.id}`);
  }

  const datasheets = data.datasheets
    .filter((datasheet) => datasheet.factionId === faction.id && datasheet.virtual === 'false')
    .map((datasheet) =>
      buildDatasheet(data, datasheet, datasheetSlugs, factionSlugs, classifySource)
    )
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const stratagems = data.stratagems.filter((strat) => strat.factionId === faction.id);
  const enhancements = data.enhancements.filter(
    (enhancement) => enhancement.factionId === faction.id
  );
  const detachmentAbilities = data.detachmentAbilities.filter((da) => da.factionId === faction.id);
  const detachmentSlugGenerator = slugUtils.createSlugGenerator(`${factionSlug}-detachment`);
  const detachments = buildDetachments(
    detachmentAbilities,
    enhancements,
    stratagems,
    detachmentSlugGenerator
  );

  return {
    ...faction,
    slug: factionSlug,
    datasheets,
    detachments
  };
};

interface GenerateDataResult {
  factions: depot.Faction[];
  coreStratagems: depot.Stratagem[];
}

const generateData = (): GenerateDataResult => {
  const data = consolidateFiles();
  const classifySource = buildSourceClassifier(data.sources);

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
    buildFactionData(data, f, datasheetSlugs, factionSlugs, classifySource)
  );
  const coreStratagems = buildCoreStratagems(data.stratagems);

  return { factions, coreStratagems };
};

export default generateData;
