#!/usr/bin/env node
/**
 * Architecture guard for the feature-slice layout:
 *   R1 every file under src/features/<feature>/ sits in screens|components|hooks|services
 *   R2 axios is imported only under src/services/
 *   R3 the shared instance (services/api) is imported only by feature services
 *   R4 a feature imports no foreign feature except features/items
 * Zero-dependency; only relative import specifiers are path-resolved (no aliases).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'src');
const featuresDir = join(srcDir, 'features');
const servicesDir = join(srcDir, 'services');
const LAYERS = new Set(['screens', 'components', 'hooks', 'services']);
const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);
const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const within = (dir, path) => path.startsWith(dir + sep);
const featureOf = (path) => relative(featuresDir, path).split(sep)[0];
const rel = (path) => relative(root, path);

const hits = [];

for (const file of walk(srcDir)) {
  // R1 — slice shape (every file, any extension)
  if (within(featuresDir, file)) {
    const parts = relative(featuresDir, file).split(sep);
    if (parts.length < 3 || !LAYERS.has(parts[1])) {
      hits.push(`${rel(file)}: R1 file is outside the screens|components|hooks|services layers of its feature`);
    }
  }

  if (!CODE_EXTENSIONS.has(extname(file))) continue;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((text, index) => {
    for (const [, spec] of text.matchAll(IMPORT_RE)) {
      const line = index + 1;

      // R2 — axios only under src/services/
      if ((spec === 'axios' || spec.startsWith('axios/')) && !within(servicesDir, file)) {
        hits.push(`${rel(file)}:${line}: R2 axios imported outside src/services — go through the feature's service, which wraps the shared instance`);
      }

      if (!spec.startsWith('.')) continue;
      const target = resolve(dirname(file), spec);

      // R3 — services/api only from a feature's services/ layer (or src/services itself)
      if (target === join(servicesDir, 'api')) {
        const fromFeatureService =
          within(featuresDir, file) && relative(featuresDir, file).split(sep)[1] === 'services';
        if (!fromFeatureService && !within(servicesDir, file)) {
          hits.push(`${rel(file)}:${line}: R3 services/api imported outside a feature's services/ layer — screens and hooks go through their service`);
        }
      }

      // R4 — cross-feature imports only toward features/items
      if (within(featuresDir, file) && within(featuresDir, target)) {
        const from = featureOf(file);
        const to = featureOf(target);
        if (to !== from && to !== 'items') {
          hits.push(`${rel(file)}:${line}: R4 cross-feature import ${from} -> ${to} — only features/items may be imported cross-feature`);
        }
      }
    }
  });
}

if (hits.length > 0) {
  console.error('check:architecture FAILED — feature-slice rules violated\n');
  for (const hit of hits) console.error(hit);
  process.exit(1);
}
console.log('check:architecture OK — slice shape, axios containment, shared-instance discipline, cross-feature isolation all hold');
