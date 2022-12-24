import fetch from 'node-fetch';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';

import convertToJSON from './convert-to-json';
import generateData from './generate-data';

const JSON_DIR = `${__dirname}/json`;
const DATA_DIR = `${__dirname}/data`;

const getFileName = (input: string) =>
  input
    .replace('http://wahapedia.ru/wh40k9ed/', '')
    .toLowerCase()
    .replace('_', '-')
    .replace('.csv', '.json');

const WAHAPEDIA_CSV_FILES = [
  'http://wahapedia.ru/wh40k9ed/Last_update.csv',
  'http://wahapedia.ru/wh40k9ed/Abilities.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_abilities.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_damage.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_keywords.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_models.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_options.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_stratagems.csv',
  'http://wahapedia.ru/wh40k9ed/Datasheets_wargear.csv',
  'http://wahapedia.ru/wh40k9ed/Factions.csv',
  'http://wahapedia.ru/wh40k9ed/PsychicPowers.csv',
  'http://wahapedia.ru/wh40k9ed/Source.csv',
  'http://wahapedia.ru/wh40k9ed/StratagemPhases.csv',
  'http://wahapedia.ru/wh40k9ed/Stratagems.csv',
  'http://wahapedia.ru/wh40k9ed/Wargear.csv',
  'http://wahapedia.ru/wh40k9ed/Wargear_list.csv',
  'http://wahapedia.ru/wh40k9ed/Warlord_traits.csv'
];

const fetchCSV = (url: string) => fetch(url).then((response) => response.text());

const init = async () => {
  if (existsSync(JSON_DIR)) {
    rmSync(JSON_DIR, { recursive: true, force: true });
  }

  if (existsSync(DATA_DIR)) {
    rmSync(DATA_DIR, { recursive: true, force: true });
  }

  console.log('Creating Directory');
  mkdirSync(JSON_DIR);

  console.log('Fetching CSV data from Wahapedia');
  const fileNames = WAHAPEDIA_CSV_FILES.map(getFileName);
  const requests = WAHAPEDIA_CSV_FILES.map(fetchCSV);
  const results = await Promise.all(requests);

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
