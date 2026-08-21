import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import type { depot, wahapedia } from '@depot/core';
import { getBattlefieldRole } from '@depot/core/utils/datasheets';
import { summarizeModelCosts } from '@depot/core/utils/model-costs';

import convertToJSON from './convert-to-json.js';
import generateData from './generate-data.js';

const DIST_DIR = import.meta.dirname;
const DATA_DIR = join(DIST_DIR, 'data');
const FACTIONS_DIR = join(DATA_DIR, 'factions');
const SOURCE_DATA_DIR = join(DIST_DIR, 'source_data');
const LOG_PREFIX = '[@depot/cli]';

const log = (message: string) => console.log(`${LOG_PREFIX} ${message}`);

const WAHAPEDIA_CSV_FILES: Record<keyof Omit<wahapedia.Data, 'lastUpdate'>, string> = {
  factions: 'Factions.csv',
  sources: 'Source.csv',
  datasheets: 'Datasheets.csv',
  datasheetAbilities: 'Datasheets_abilities.csv',
  datasheetKeywords: 'Datasheets_keywords.csv',
  datasheetModels: 'Datasheets_models.csv',
  datasheetOptions: 'Datasheets_options.csv',
  datasheetWargear: 'Datasheets_wargear.csv',
  datasheetUnitComposition: 'Datasheets_unit_composition.csv',
  datasheetModelCosts: 'Datasheets_models_cost.csv',
  datasheetStratagems: 'Datasheets_stratagems.csv',
  datasheetEnhancements: 'Datasheets_enhancements.csv',
  datasheetDetachmentAbilities: 'Datasheets_detachment_abilities.csv',
  datasheetLeaders: 'Datasheets_leader.csv',
  stratagems: 'Stratagems.csv',
  abilities: 'Abilities.csv',
  enhancements: 'Enhancements.csv',
  detachmentAbilities: 'Detachment_abilities.csv',
  detachments: 'Detachments.csv',
  detachmentChapterDp: 'Detachments_chapter_dp.csv'
};
const LAST_UPDATE_CSV = 'Last_update.csv';

const WAHAPEDIA_BASE_URL = 'https://wahapedia.ru/wh40k11ed/';

const forceDownload = process.argv.includes('--force-download');

/** CSVs are stored lowercased with dashes, e.g. `Datasheets_models.csv` -> `datasheets-models.csv`. */
const sourceFileName = (fileName: string) => fileName.toLowerCase().replace(/_/g, '-');

const init = async () => {
  rmSync(DATA_DIR, { recursive: true, force: true });

  // A download that dies part way leaves some CSVs behind. Treat the cache as
  // usable only when every file is there, or a rerun fails on the missing one.
  const cachedSourceFiles = [...Object.values(WAHAPEDIA_CSV_FILES), LAST_UPDATE_CSV].map(
    (fileName) => join(SOURCE_DATA_DIR, sourceFileName(fileName))
  );
  const sourceDataExists =
    existsSync(SOURCE_DATA_DIR) && cachedSourceFiles.every((path) => existsSync(path));
  const shouldDownload = forceDownload || !sourceDataExists;

  if (forceDownload && existsSync(SOURCE_DATA_DIR)) {
    log('Force download flag detected, removing existing source data');
    rmSync(SOURCE_DATA_DIR, { recursive: true, force: true });
  }

  log('Creating directories');
  mkdirSync(SOURCE_DATA_DIR, { recursive: true });

  log(
    shouldDownload
      ? 'Fetching CSV data from Wahapedia (wh40k11ed)'
      : 'Using existing source data files'
  );
  // Raw CSVs are kept in source_data so reruns work offline and for debugging.
  const loadTable = async (fileName: string) => {
    const csvPath = join(SOURCE_DATA_DIR, sourceFileName(fileName));
    const csv = shouldDownload
      ? await fetch(`${WAHAPEDIA_BASE_URL}${fileName}`).then((response) => response.text())
      : readFileSync(csvPath, 'utf-8');
    if (shouldDownload) writeFileSync(csvPath, csv);
    return convertToJSON(csv);
  };

  log('Parsing data from CSV');
  const tables = Object.fromEntries(
    await Promise.all(
      Object.entries(WAHAPEDIA_CSV_FILES).map(
        async ([key, fileName]): Promise<[string, unknown[]]> => [key, await loadTable(fileName)]
      )
    )
  ) as Omit<wahapedia.Data, 'lastUpdate'>;
  const data: wahapedia.Data = {
    ...tables,
    lastUpdate: (await loadTable(LAST_UPDATE_CSV))[0]?.lastUpdate ?? null
  };

  log('Generating faction files');
  mkdirSync(FACTIONS_DIR, { recursive: true });

  const index: depot.Index[] = [];
  const { factions, coreStratagems, dataVersion } = generateData(data);

  factions.forEach((faction) => {
    const factionDir = join(FACTIONS_DIR, faction.slug);
    const datasheetsDir = join(factionDir, 'datasheets');

    mkdirSync(datasheetsDir, { recursive: true });

    const manifestDatasheets: depot.DatasheetSummary[] = faction.datasheets.map((datasheet) => ({
      id: datasheet.id,
      slug: datasheet.slug,
      name: datasheet.name,
      factionId: faction.id,
      factionSlug: faction.slug,
      isSupport: datasheet.isSupport,
      role: getBattlefieldRole(datasheet),
      points: summarizeModelCosts(datasheet.modelCosts),
      supplementKey: datasheet.supplementKey,
      path: `/data/factions/${faction.slug}/datasheets/${datasheet.id}.json`,
      supplementSlug: datasheet.supplementSlug,
      supplementName: datasheet.supplementName,
      supplementLabel: datasheet.supplementLabel,
      isSupplement: datasheet.isSupplement,
      link: datasheet.link,
      isForgeWorld: datasheet.isForgeWorld,
      isLegends: datasheet.isLegends
    }));

    if (manifestDatasheets.length === 0) {
      log(`Skipping ${faction.slug} (no datasheets)`);
      return;
    }

    const manifest: depot.FactionManifest = {
      id: faction.id,
      slug: faction.slug,
      name: faction.name,
      link: faction.link,
      datasheets: manifestDatasheets,
      detachments: faction.detachments,
      dataVersion,
      datasheetCount: manifestDatasheets.length,
      detachmentCount: faction.detachments.length
    };

    const manifestPath = join(factionDir, 'faction.json');
    log(`Creating ${manifestPath}`);
    writeFileSync(manifestPath, JSON.stringify(manifest));

    log(`Creating ${manifestDatasheets.length} datasheets for ${faction.slug}`);
    faction.datasheets.forEach((datasheet) => {
      const datasheetPath = join(datasheetsDir, `${datasheet.id}.json`);
      writeFileSync(datasheetPath, JSON.stringify(datasheet));
    });

    const { link, datasheets, detachments, ...summary } = manifest;
    index.push({ ...summary, path: `/data/factions/${faction.slug}/faction.json` });
  });

  log('Generating index file');
  writeFileSync(join(DATA_DIR, 'index.json'), JSON.stringify(index));

  log('Creating core stratagems file');
  writeFileSync(join(DATA_DIR, 'core-stratagems.json'), JSON.stringify(coreStratagems));
};

init()
  .then(() => log('Done!'))
  .catch((e) => {
    console.error(`${LOG_PREFIX} CLI failed`, e);
    process.exit(1);
  });
