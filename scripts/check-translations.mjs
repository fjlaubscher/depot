import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../packages/web/package.json', import.meta.url));
const { createInstance } = require('i18next');
const root = resolve(
  process.argv[2] ?? fileURLToPath(new URL('../packages/web/src/locales/', import.meta.url))
);
const errors = [];
const report = (language, namespace, key, message) =>
  errors.push(`${language}/${namespace}:${key || '<root>'}: ${message}`);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const plural = /_(zero|one|two|few|many|other)$/;
const parameters = (text) =>
  [...new Set([...text.matchAll(/{{\s*-?\s*([^,}\s]+)[^}]*}}/g)].map((match) => match[1]))].sort();

function flatten(value, language, namespace, prefix = '', result = {}) {
  if (!isObject(value)) {
    report(language, namespace, prefix, 'expected an object');
    return result;
  }
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') result[path] = child;
    else if (isObject(child)) {
      result[path] = null;
      flatten(child, language, namespace, path, result);
    } else report(language, namespace, path, 'expected text or an object');
  }
  return result;
}

try {
  const languages = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (!languages.includes('en')) throw new Error('en/<root>: missing English reference');
  const resources = {};
  for (const language of languages) {
    if (!Intl.PluralRules.supportedLocalesOf([language]).length)
      throw new Error(`${language}/<root>: unsupported language`);
    resources[language] = {};
    for (const file of (await readdir(resolve(root, language))).filter((file) =>
      file.endsWith('.json')
    )) {
      const namespace = file.slice(0, -5);
      try {
        resources[language][namespace] = JSON.parse(
          await readFile(resolve(root, language, file), 'utf8')
        );
      } catch (error) {
        report(language, namespace, '', error.message);
      }
    }
  }
  const reference = resources.en;
  const translator = createInstance();
  await translator.init({
    resources,
    fallbackLng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false }
  });
  const englishCategories = new Intl.PluralRules('en').resolvedOptions().pluralCategories;

  for (const language of languages) {
    const rules = new Intl.PluralRules(language);
    const categories = rules.resolvedOptions().pluralCategories;
    for (const namespace of new Set([
      ...Object.keys(reference),
      ...Object.keys(resources[language])
    ])) {
      const source = reference[namespace];
      const target = resources[language][namespace];
      if (!source || !target) {
        report(language, namespace, '', source ? 'missing namespace' : 'unexpected namespace');
        continue;
      }
      const expected = flatten(source, 'en', namespace);
      const actual = flatten(target, language, namespace);
      const families = new Set(
        Object.keys(expected)
          .filter((key) => plural.test(key))
          .map((key) => key.replace(plural, ''))
      );
      for (const key of Object.keys(expected).filter((key) => !plural.test(key))) {
        if (!(key in actual) || typeof expected[key] !== typeof actual[key])
          report(language, namespace, key, 'missing text key or divergent structure');
      }
      for (const family of families) {
        for (const category of categories) {
          const key = `${family}_${category}`;
          // Locale-only categories may use i18next's English fallback; shared categories must be translated.
          if (
            !(key in actual) &&
            !(family in actual) &&
            (language === 'en' || englishCategories.includes(category))
          ) {
            report(language, namespace, key, 'missing plural variant');
          }
        }
        for (const count of [0, 1, 2, 3, 5, 11, 100, 1_000_000]) {
          if (!translator.exists(family, { lng: language, ns: namespace, count })) {
            report(language, namespace, family, `unresolved plural for count=${count}`);
          }
        }
      }
      for (const [key, text] of Object.entries(actual)) {
        if (text === null) {
          if (expected[key] !== null)
            report(language, namespace, key, 'unexpected object or divergent structure');
          continue;
        }
        const match = key.match(plural);
        const family = key.replace(plural, '');
        const isVariant = match && families.has(family);
        if (isVariant && !categories.includes(match[1]) && match[1] !== 'zero') {
          report(language, namespace, key, 'invalid plural category for language');
        }
        const sourceText =
          expected[key] ??
          (isVariant || families.has(key) ? expected[`${family}_other`] : undefined);
        if (sourceText === undefined)
          report(language, namespace, key, 'unexpected key or divergent structure');
        else if (sourceText === null) report(language, namespace, key, 'expected an object');
        else if (JSON.stringify(parameters(text)) !== JSON.stringify(parameters(sourceText))) {
          report(
            language,
            namespace,
            key,
            `interpolation parameters differ: expected ${parameters(sourceText).join(', ')}, got ${parameters(text).join(', ')}`
          );
        }
      }
    }
  }
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else
    console.log(
      `Translations valid: ${languages.join(', ')} (${Object.keys(reference).length} namespaces).`
    );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
