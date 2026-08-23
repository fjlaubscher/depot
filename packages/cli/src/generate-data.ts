import type { wahapedia, depot } from '@depot/core';
import { sortByName } from '@depot/core/utils/common';
import { buildFactionDetachments, toDepotStratagem } from '@depot/core/utils/detachments';
import { normalizeModelCosts } from '@depot/core/utils/model-costs';
import { createSlugGenerator } from '@depot/core/utils/slug';
import { groupWargearProfiles } from '@depot/core/utils/wargear';
import { supplements } from './config/supplements.js';

const CODEX_SLUG = 'codex';

const buildDatasheet = (
  data: wahapedia.Data,
  datasheet: wahapedia.Datasheet,
  datasheetSlugs: Map<string, string>,
  factionSlugs: Map<string, string>
): depot.Datasheet => {
  const own = <T extends { datasheetId: string }>(rows: T[]): T[] =>
    rows.filter((row) => row.datasheetId === datasheet.id);

  const abilities = own(data.datasheetAbilities).flatMap((a): depot.Ability[] => {
    if (a.abilityId) {
      const referenced = data.abilities.find((ability) => ability.id === a.abilityId);
      return referenced
        ? [{ ...referenced, type: a.type, parameter: a.parameter || referenced.parameter }]
        : [];
    }
    // Inline abilities carry no id / legend / factionId of their own.
    return a.name
      ? [
          {
            id: '',
            name: a.name,
            legend: '',
            factionId: '',
            description: a.description,
            type: a.type,
            parameter: a.parameter
          }
        ]
      : [];
  });

  const source = data.sources.find((entry) => entry.id === datasheet.sourceId);
  const sourceName = source?.name.trim() ?? '';
  const isForgeWorld = sourceName.endsWith('(Forge World)');
  const isLegends = sourceName.endsWith('(Warhammer Legends)') || sourceName.startsWith('Legends:');

  const supplementInfo = supplements[datasheet.sourceId];
  const supplementKey = supplementInfo?.slug ?? CODEX_SLUG;
  const isSupplement = supplementKey !== CODEX_SLUG;
  const supplementLabel = isSupplement && supplementInfo ? supplementInfo.name : 'None';

  // Enhancements and detachment abilities already ship on the faction's
  // detachments; only the stratagem link is per-datasheet.
  const stratagemIds = own(data.datasheetStratagems).map((ds) => ds.stratagemId);

  const leaders = data.datasheetLeaders
    .filter((dl) => dl.leaderId === datasheet.id)
    .map((dl) => ({
      id: dl.attachedId,
      slug: datasheetSlugs.get(dl.attachedId) ?? 'Unknown'
    }));

  return {
    id: datasheet.id,
    slug: datasheetSlugs.get(datasheet.id)!,
    name: datasheet.name,
    factionId: datasheet.factionId,
    factionSlug: factionSlugs.get(datasheet.factionId)!,
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
    keywords: own(data.datasheetKeywords),
    models: own(data.datasheetModels),
    options: own(data.datasheetOptions),
    wargear: groupWargearProfiles(own(data.datasheetWargear)),
    unitComposition: own(data.datasheetUnitComposition),
    modelCosts: normalizeModelCosts(own(data.datasheetModelCosts)),
    stratagemIds,
    leaders,
    isForgeWorld,
    isLegends
  };
};

const buildFactionData = (
  data: wahapedia.Data,
  faction: wahapedia.Faction,
  datasheetSlugs: Map<string, string>,
  factionSlugs: Map<string, string>
): depot.Faction => {
  const factionSlug = factionSlugs.get(faction.id)!;

  const datasheets = sortByName(
    data.datasheets
      .filter((datasheet) => datasheet.factionId === faction.id && datasheet.virtual === 'false')
      .map((datasheet) => buildDatasheet(data, datasheet, datasheetSlugs, factionSlugs))
  );

  const detachments = buildFactionDetachments({
    factionId: faction.id,
    detachments: data.detachments,
    chapterDp: data.detachmentChapterDp,
    abilities: data.detachmentAbilities.filter((da) => da.factionId === faction.id),
    enhancements: data.enhancements.filter((enhancement) => enhancement.factionId === faction.id),
    stratagems: data.stratagems.filter((strat) => strat.factionId === faction.id),
    createSlug: createSlugGenerator(`${factionSlug}-detachment`)
  });

  return {
    ...faction,
    slug: factionSlug,
    datasheets,
    detachments
  };
};

const generateData = (data: wahapedia.Data) => {
  const factionSlugGenerator = createSlugGenerator('faction');
  const datasheetSlugGenerator = createSlugGenerator('datasheet');
  const factionSlugs = new Map(data.factions.map((f) => [f.id, factionSlugGenerator(f.name)]));
  const datasheetSlugs = new Map(
    data.datasheets.map((d) => [d.id, datasheetSlugGenerator(d.name)])
  );

  const factions = data.factions.map((f) =>
    buildFactionData(data, f, datasheetSlugs, factionSlugs)
  );
  const coreStratagems = sortByName(
    data.stratagems.filter((stratagem) => !stratagem.factionId?.trim()).map(toDepotStratagem)
  );

  return { factions, coreStratagems, dataVersion: data.lastUpdate ?? undefined };
};

export default generateData;
