#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const SOURCE_DATA_DIR = join(REPO_ROOT, 'packages', 'cli', 'dist', 'source_data');

const TARGET_DATASHEET_ID = '000001157';

const argId =
  process.argv.slice(2).find((value) => !value.startsWith('--')) ??
  process.argv
    .slice(2)
    .find((value) => value.startsWith('--id='))
    ?.slice('--id='.length);

const datasheetId = (argId ?? TARGET_DATASHEET_ID).padStart(9, '0');

async function parsePipeSeparatedCsv(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== '');

  const headerLine = lines.shift();
  if (!headerLine) {
    throw new Error(`Missing header row in ${filePath}`);
  }

  const headers = headerLine.split('|');

  return lines.map((line, index) => {
    const columns = line.split('|');

    if (columns.length !== headers.length) {
      throw new Error(
        `Row ${index + 2} in ${filePath} has ${columns.length} columns, expected ${headers.length}`,
      );
    }

    return headers.reduce((entry, key, columnIndex) => {
      entry[key] = columns[columnIndex] ?? '';
      return entry;
    }, {});
  });
}

async function main() {
  const datasheetsPath = join(SOURCE_DATA_DIR, 'datasheets.csv');
  const wargearPath = join(SOURCE_DATA_DIR, 'datasheets-wargear.csv');

  const [datasheets, wargear] = await Promise.all([
    parsePipeSeparatedCsv(datasheetsPath),
    parsePipeSeparatedCsv(wargearPath),
  ]);

  const datasheet = datasheets.find((entry) => entry.id === datasheetId);

  if (!datasheet) {
    console.error(
      `ERROR: Datasheet ${datasheetId} not found in ${relativePath(datasheetsPath)}.`,
    );
    process.exitCode = 1;
    return;
  }

  const associatedWargear = wargear.filter(
    (entry) => entry.datasheet_id === datasheetId && entry.name.trim() !== '',
  );

  if (associatedWargear.length === 0) {
    console.error(
      [
        `ERROR: No wargear entries found for datasheet ${datasheetId} (${datasheet.name}).`,
        `       Checked ${relativePath(wargearPath)}.`,
        '       Wahapedia source data may be missing or the conversion pipeline failed.',
      ].join('\n'),
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `${associatedWargear.length} wargear entries found for ${datasheetId} (${datasheet.name}):`,
  );
  associatedWargear.forEach((item) => {
    const profile = [item.range, item.type, item.A, item.BS_WS, item.S, item.AP, item.D]
      .map((value) => value || '-')
      .join(' | ');

    const description = stripHtml(item.description);
    console.log(`- ${item.name} (${profile})`);
    if (description) {
      console.log(`  ${description}`);
    }
  });
}

function stripHtml(value) {
  return value ? value.replace(/<[^>]+>/g, '').trim() : '';
}

function relativePath(absolutePath) {
  return absolutePath.startsWith(REPO_ROOT)
    ? absolutePath.slice(REPO_ROOT.length + 1)
    : absolutePath;
}

main().catch((error) => {
  console.error('ERROR: Failed to validate datasheet wargear:');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
