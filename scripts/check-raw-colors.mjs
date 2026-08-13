#!/usr/bin/env node
/**
 * Raw-color scan: no #hex / rgb() / hsl() / oklch() literals outside the token
 * file (src/index.css) and src/assets/. Use var(--token) instead. A line
 * containing "ds-allow" in a comment is skipped (false-positive escape hatch).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'src');
const EXTENSIONS = new Set(['.css', '.ts', '.tsx']);
const excludedFile = join(srcDir, 'index.css');
const excludedDir = join(srcDir, 'assets');

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (path === excludedDir) continue;
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

const hits = [];
for (const file of walk(srcDir)) {
  if (!EXTENSIONS.has(extname(file)) || file === excludedFile) continue;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes('ds-allow')) return;
    const matches = line.match(COLOR_LITERAL);
    if (matches) {
      hits.push(`${relative(root, file)}:${index + 1}: ${matches.join(', ')}`);
    }
  });
}

if (hits.length > 0) {
  console.error('check:colors FAILED — raw color literals outside the token file; use var(--token), or mark a false positive with a ds-allow comment\n');
  for (const hit of hits) console.error(hit);
  process.exit(1);
}
console.log('check:colors OK — no raw color literals outside src/index.css');
