import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { depot } from '@depot/core';

import convertToJSON from './convert-to-json';
import generateData from './generate-data';

const JSON_DIR = join(__dirname, 'json');
const DATA_DIR = join(__dirname, 'data');
const SOURCE_DATA_DIR = join(__dirname, 'source_data');

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
  mkdirSync(DATA_DIR);

  const index: depot.Index[] = [];
  const data = generateData();

  data.forEach((faction) => {
    const filePath = join(DATA_DIR, `${faction.id}.json`);

    // Calculate metadata counts for the index
    const datasheetCount = faction.datasheets.length;
    const stratagemCount = faction.stratagems.length;
    const enhancementCount = faction.enhancements.length;
    const detachmentCount = faction.detachmentAbilities.length;

    index.push({
      id: faction.id,
      name: faction.name,
      path: `/data/${faction.id}.json`,
      datasheetCount,
      stratagemCount,
      enhancementCount,
      detachmentCount
    });

    console.log(`Creating ${filePath}`);
    writeFileSync(filePath, JSON.stringify(faction));
  });

  console.log('Generating index file');
  writeFileSync(join(DATA_DIR, 'index.json'), JSON.stringify(index));
};

init()
  .then(() => console.log('Done!'))
  .catch((e) => console.error(e));
