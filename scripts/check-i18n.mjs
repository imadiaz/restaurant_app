import { readFile } from 'node:fs/promises';

const localePaths = {
  en: new URL('../src/locales/en/translation.json', import.meta.url),
  es: new URL('../src/locales/es/translation.json', import.meta.url),
};

const flattenKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child)
    ? flattenKeys(child, path)
    : [path];
});

const locales = Object.fromEntries(await Promise.all(
  Object.entries(localePaths).map(async ([language, path]) => [
    language,
    JSON.parse(await readFile(path, 'utf8')),
  ]),
));

const referenceKeys = new Set(flattenKeys(locales.en));
const spanishKeys = new Set(flattenKeys(locales.es));
const missingInSpanish = [...referenceKeys].filter((key) => !spanishKeys.has(key));
const missingInEnglish = [...spanishKeys].filter((key) => !referenceKeys.has(key));

if (missingInSpanish.length || missingInEnglish.length) {
  if (missingInSpanish.length) console.error(`Missing in es:\n${missingInSpanish.join('\n')}`);
  if (missingInEnglish.length) console.error(`Missing in en:\n${missingInEnglish.join('\n')}`);
  process.exitCode = 1;
} else {
  console.info(`i18n parity OK: ${referenceKeys.size} keys per language`);
}
