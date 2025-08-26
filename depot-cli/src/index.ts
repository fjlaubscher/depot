import fetch from 'node-fetch';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { depot } from 'depot-core';

import convertToJSON from './convert-to-json';
import generateData from './generate-data';

const JSON_DIR = `${__dirname}/json`;
const DATA_DIR = `${__dirname}/data`;
const SOURCE_DATA_DIR = `${__dirname}/source_data`;

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

const init = async () => {
  if (existsSync(JSON_DIR)) {
    rmSync(JSON_DIR, { recursive: true, force: true });
  }

  if (existsSync(DATA_DIR)) {
    rmSync(DATA_DIR, { recursive: true, force: true });
  }

  if (existsSync(SOURCE_DATA_DIR)) {
    rmSync(SOURCE_DATA_DIR, { recursive: true, force: true });
  }

  console.log('Creating Directories');
  mkdirSync(JSON_DIR);
  mkdirSync(SOURCE_DATA_DIR);

  console.log('Fetching CSV data from Wahapedia');
  const fileNames = WAHAPEDIA_CSV_FILES.map(getFileName);
  const csvFileNames = WAHAPEDIA_CSV_FILES.map(getCSVFileName);
  const requests = WAHAPEDIA_CSV_FILES.map((fileName) =>
    fetchCSV(`http://wahapedia.ru/wh40k10ed/${fileName}`)
  );
  const results = await Promise.all(requests);

  console.log('Saving raw CSV files for debugging');
  for (let i = 0; i < results.length; i++) {
    const csvPath = `${SOURCE_DATA_DIR}/${csvFileNames[i]}`;
    console.log(`Saving ${csvPath}`);
    writeFileSync(csvPath, results[i].toString());
  }

  console.log('Parsing data from CSV');
  for (let i = 0; i < results.length; i++) {
    const parsedData = convertToJSON(
      results[i].toString(),
      fileNames[i] !== 'datasheets-keywords.json'
    );
    console.log(`Creating ${JSON_DIR}/${fileNames[i]}`);
    writeFileSync(`${JSON_DIR}/${fileNames[i]}`, JSON.stringify(parsedData));
  }

  console.log('Generating faction files');
  mkdirSync(DATA_DIR);

  const index: depot.Index[] = [];
  const data = generateData();

  data.forEach((faction) => {
    const filePath = `${DATA_DIR}/${faction.id}.json`;
    index.push({ id: faction.id, name: faction.name, path: `/data/${faction.id}.json` });
    console.log(`Creating ${filePath}`);
    writeFileSync(filePath, JSON.stringify(faction));
  });

  console.log('Generating index file');
  writeFileSync(`${DATA_DIR}/index.json`, JSON.stringify(index));
};

init()
  .then(() => console.log('Done!'))
  .catch((e) => console.error(e));
