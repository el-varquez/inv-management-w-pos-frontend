#!/usr/bin/env node
/**
 * Token drift guard: src/index.css :root must exactly match design/tokens.json.
 * Comparison strips all whitespace inside values, so formatting never matters.
 * Changing design/tokens.json is the sanctioned way to evolve the palette.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cssPath = fileURLToPath(new URL('../src/index.css', import.meta.url));
const tokensPath = fileURLToPath(new URL('../design/tokens.json', import.meta.url));

const css = readFileSync(cssPath, 'utf8');
const canonical = JSON.parse(readFileSync(tokensPath, 'utf8'));

const actual = {};
for (const [, body] of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    actual[name] = value.trim();
  }
}

const squash = (value) => value.replace(/\s+/g, '');
const problems = [];

for (const [name, expected] of Object.entries(canonical)) {
  if (!(name in actual)) {
    problems.push(`missing: ${name} — expected "${expected}" in :root`);
  } else if (squash(actual[name]) !== squash(expected)) {
    problems.push(`mismatch: ${name}\n  expected: ${expected}\n  actual:   ${actual[name]}`);
  }
}
for (const name of Object.keys(actual)) {
  if (!(name in canonical)) {
    problems.push(`extra: ${name} is in :root but not in design/tokens.json — if intentional, add it there in the same PR`);
  }
}

if (problems.length > 0) {
  console.error('check:tokens FAILED — src/index.css :root diverges from design/tokens.json\n');
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log(`check:tokens OK — ${Object.keys(canonical).length} tokens match design/tokens.json`);
