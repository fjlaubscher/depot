import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { depot } from '@depot/core';

import convertToJSON from './convert-to-json.js';
import generateData from './generate-data.js';

// Types only; runtime from core is used for slug utils in generate-data

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = join(PKG_ROOT, 'dist');
const JSON_DIR = join(DIST_DIR, 'json');
const DATA_DIR = join(DIST_DIR, 'data');
const FACTIONS_DIR = join(DATA_DIR, 'factions');
const SOURCE_DATA_DIR = join(DIST_DIR, 'source_data');

const getFileName = (input: string) =>
  input.toLowerCase().replace(/_/g, '-').replace('.csv', '.json');

const getCSVFileName = (input: string) => input.toLowerCase().replace(/_/g, '-');

const WAHAPEDIA_CSV_FILES = [
  'Factions.csv',
  'Source.csv',
  'Datasheets.csv',
  'Datasheets_abilities.csv',
  'Datasheets_keywords.csv',
  'Datasheets_models.csv',
  'Datasheets_options.csv',
  'Datasheets_wargear.csv',
  'Datasheets_unit_composition.csv',
  'Datasheets_models_cost.csv',
  'Datasheets_stratagems.csv',
  'Datasheets_enhancements.csv',
  'Datasheets_detachment_abilities.csv',
  'Datasheets_leader.csv',
  'Stratagems.csv',
  'Abilities.csv',
  'Enhancements.csv',
  'Detachment_abilities.csv',
  'Last_update.csv'
];

const fetchCSV = (url: string) => fetch(url).then((response) => response.text());

const forceDownload = process.argv.includes('--force-download');

const init = async () => {
  if (existsSync(JSON_DIR)) {
    rmSync(JSON_DIR, { recursive: true, force: true });
  }

  if (existsSync(DATA_DIR)) {
    rmSync(DATA_DIR, { recursive: true, force: true });
  }

  const sourceDataExists = existsSync(SOURCE_DATA_DIR);
  const shouldDownload = forceDownload || !sourceDataExists;

  if (forceDownload && sourceDataExists) {
    console.log('Force download flag detected, removing existing source data');
    rmSync(SOURCE_DATA_DIR, { recursive: true, force: true });
  }

  console.log('Creating Directories');
  mkdirSync(JSON_DIR);
  if (!existsSync(SOURCE_DATA_DIR)) {
    mkdirSync(SOURCE_DATA_DIR);
  }

  const fileNames = WAHAPEDIA_CSV_FILES.map(getFileName);
  const csvFileNames = WAHAPEDIA_CSV_FILES.map(getCSVFileName);
  let results: string[];

  if (shouldDownload) {
    console.log('Fetching CSV data from Wahapedia');
    const requests = WAHAPEDIA_CSV_FILES.map((fileName) =>
      fetchCSV(`http://wahapedia.ru/wh40k10ed/${fileName}`)
    );
    results = await Promise.all(requests);

    console.log('Saving raw CSV files for debugging');
    for (let i = 0; i < results.length; i++) {
      const csvPath = join(SOURCE_DATA_DIR, csvFileNames[i]);
      console.log(`Saving ${csvPath}`);
      writeFileSync(csvPath, results[i]);
    }
  } else {
    console.log('Using existing source data files');
    results = csvFileNames.map((fileName) => {
      const csvPath = join(SOURCE_DATA_DIR, fileName);
      console.log(`Reading ${csvPath}`);
      return readFileSync(csvPath, 'utf-8');
    });
  }

  console.log('Parsing data from CSV');
  for (let i = 0; i < results.length; i++) {
    const parsedData = convertToJSON(results[i]);
    const jsonPath = join(JSON_DIR, fileNames[i]);
    console.log(`Creating ${jsonPath}`);
    writeFileSync(jsonPath, JSON.stringify(parsedData));
  }

  console.log('Generating faction files');
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(FACTIONS_DIR, { recursive: true });

  const index: depot.Index[] = [];
  const { factions, coreStratagems } = generateData();

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
      role: datasheet.role,
      path: `/data/factions/${faction.slug}/datasheets/${datasheet.id}.json`,
      supplementSlug: datasheet.supplementSlug,
      supplementName: datasheet.supplementName,
      link: datasheet.link,
      isForgeWorld: datasheet.isForgeWorld,
      isLegends: datasheet.isLegends
    }));

    const manifest: depot.FactionManifest = {
      id: faction.id,
      slug: faction.slug,
      name: faction.name,
      link: faction.link,
      datasheets: manifestDatasheets,
      detachments: faction.detachments,
      datasheetCount: manifestDatasheets.length,
      detachmentCount: faction.detachments.length
    };

    const manifestPath = join(factionDir, 'faction.json');
    console.log(`Creating ${manifestPath}`);
    writeFileSync(manifestPath, JSON.stringify(manifest));

    console.log(`Creating ${manifestDatasheets.length} datasheets for ${faction.slug}`);
    faction.datasheets.forEach((datasheet) => {
      const datasheetPath = join(datasheetsDir, `${datasheet.id}.json`);
      writeFileSync(datasheetPath, JSON.stringify(datasheet));
    });

    index.push({
      id: faction.id,
      slug: faction.slug,
      name: faction.name,
      path: `/data/factions/${faction.slug}/faction.json`,
      datasheetCount: manifestDatasheets.length,
      detachmentCount: faction.detachments.length
    });
  });

  console.log('Generating index file');
  writeFileSync(join(DATA_DIR, 'index.json'), JSON.stringify(index));

  console.log('Creating core stratagems file');
  writeFileSync(join(DATA_DIR, 'core-stratagems.json'), JSON.stringify(coreStratagems));
};

init()
  .then(() => console.log('Done!'))
  .catch((e) => console.error(e));
