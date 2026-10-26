import { readFile, readdir } from 'node:fs/promises';
import ts from 'typescript';
import i18next from 'i18next';

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

const usedKeys = new Map();
const addKey = (key, source) => {
  if (!usedKeys.has(key)) usedKeys.set(key, source);
};

const literalKeys = (node) => {
  if (ts.isStringLiteralLike(node)) return [node.text];
  if (ts.isConditionalExpression(node)) return [...literalKeys(node.whenTrue), ...literalKeys(node.whenFalse)];
  if (ts.isArrayLiteralExpression(node)) return node.elements.flatMap(literalKeys);
  return [];
};

// Catalog parity alone cannot catch a key missing from both languages.
const inspectSource = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      await inspectSource(new URL(`${entry.name}/`, directory));
    } else if (/\.tsx?$/.test(entry.name)) {
      const source = ts.createSourceFile(url.pathname, await readFile(url, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = (node) => {
        const location = `${url.pathname}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't' && node.arguments[0]) {
          literalKeys(node.arguments[0]).forEach((key) => addKey(key, location));
        }
        if (ts.isPropertyAssignment(node) && ['labelKey', 'textKey'].includes(node.name.getText(source))) {
          literalKeys(node.initializer).forEach((key) => addKey(key, location));
        }
        // The history dropdown builds these keys from the order status values.
        if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'OrderStatus' && node.initializer) {
          const values = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
          if (ts.isObjectLiteralExpression(values)) {
            values.properties.filter(ts.isPropertyAssignment).forEach((property) => {
              literalKeys(property.initializer).forEach((status) => addKey(`orders.status.${status.toLowerCase()}`, location));
            });
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
};
await inspectSource(new URL('../src/', import.meta.url));

for (const [language, catalog] of Object.entries(locales)) {
  const translator = i18next.createInstance();
  await translator.init({ lng: language, fallbackLng: false, resources: { [language]: { translation: catalog } } });
  for (const [key, source] of usedKeys) {
    if (!translator.exists(key, { count: 1 }) || !translator.exists(key, { count: 2 })) {
      console.error(`Missing in ${language}: ${key} (${source})`);
      process.exitCode = 1;
    }
  }
}
if (!process.exitCode) console.info(`i18n usage OK: ${usedKeys.size} referenced keys resolve in both languages (including plurals and order statuses)`);
