import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, copyFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const checker = new URL('./check-translations.mjs', import.meta.url);
const english = {
  greeting: 'Hello {{name}} {{place}}',
  units_one: '{{count}} unit',
  units_other: '{{count}} units'
};
const french = {
  greeting: '{{place}} : bonjour {{name}}',
  units_one: '{{count}} unité',
  units_other: '{{count}} unités'
};

async function check(t, languages) {
  const root = await mkdtemp(join(tmpdir(), 'muster-translations-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [language, namespaces] of Object.entries(languages)) {
    await mkdir(join(root, language));
    for (const [namespace, data] of Object.entries(namespaces)) {
      await writeFile(join(root, language, `${namespace}.json`), JSON.stringify(data));
    }
  }
  return spawnSync(process.execPath, [fileURLToPath(checker), root], { encoding: 'utf8' });
}

test('accepts interpolation reordering and French plural fallback at zero, one, several and a million', async (t) => {
  const result = await check(t, { en: { common: english }, fr: { common: french } });
  assert.equal(result.status, 0, result.stderr);
});

test('accepts legitimate extra plural categories and an explicit zero', async (t) => {
  const result = await check(t, {
    en: { common: english },
    fr: {
      common: { ...french, units_many: '{{count}} unités', units_zero: 'Aucune unité ({{count}})' }
    }
  });
  assert.equal(result.status, 0, result.stderr);
});

for (const [name, data, key] of [
  ['missing key', { units_one: '{{count}} unité', units_other: '{{count}} unités' }, 'greeting'],
  ['removed parameter', { ...french, greeting: 'Bonjour {{name}}' }, 'greeting'],
  ['renamed parameter', { ...french, greeting: '{{location}} : bonjour {{name}}' }, 'greeting'],
  [
    'incomplete plural family',
    { greeting: french.greeting, units_one: french.units_one },
    'units_other'
  ],
  ['divergent structure', { ...french, greeting: { text: 'Bonjour' } }, 'greeting'],
  ['unexpected key', { ...french, surprise: 'Bonjour' }, 'surprise'],
  ['unexpected empty object', { ...french, surprise: {} }, 'surprise'],
  ['object replaced by text', { ...french, details: 'Bonjour' }, 'details'],
  ['invalid value', { ...french, greeting: [] }, 'greeting']
]) {
  test(`rejects ${name} with a located diagnostic`, async (t) => {
    const reference = name === 'object replaced by text' ? { ...english, details: {} } : english;
    const result = await check(t, { en: { common: reference }, fr: { common: data } });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`fr/common.*${key}`));
  });
}

test('discovers a new incomplete language without a manual language list', async (t) => {
  const result = await check(t, {
    en: { common: english },
    fr: { common: french },
    de: { common: {} }
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /de\/common.*greeting/);
});

test('rejects missing and extra namespaces', async (t) => {
  const result = await check(t, { en: { common: english }, fr: { extra: french } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /fr\/common/);
  assert.match(result.stderr, /fr\/extra/);
});

test('validates the reference dictionary too', async (t) => {
  const result = await check(t, {
    en: { common: { units_one: '{{count}} unit' } },
    fr: { common: french }
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /en\/common.*units_other/);
});

test('works from a checkout path containing spaces and non-ASCII characters', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'muster translations-é-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'scripts'));
  await mkdir(join(root, 'packages'));
  await symlink(
    fileURLToPath(new URL('../packages/web', import.meta.url)),
    join(root, 'packages/web'),
    'junction'
  );
  await copyFile(checker, join(root, 'scripts/check-translations.mjs'));
  const result = spawnSync(process.execPath, [join(root, 'scripts/check-translations.mjs')], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
});
