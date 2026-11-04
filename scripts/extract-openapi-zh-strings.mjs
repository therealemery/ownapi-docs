import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function hasCJK(s) {
  return /[\u4e00-\u9fff]/.test(s);
}

async function walk(dir, files = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, files);
    else if (e.name.endsWith('.json')) files.push(p);
  }
  return files;
}

function collectStrings(obj, key, out) {
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'string') {
    if (key && ['description', 'summary', 'title', 'name'].includes(key) && hasCJK(obj)) {
      out.add(obj);
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'string' && hasCJK(item)) out.add(item);
      else collectStrings(item, null, out);
    }
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('x-apifox')) continue;
      if (['description', 'summary', 'title', 'name'].includes(k) && typeof v === 'string' && hasCJK(v)) {
        out.add(v);
      } else {
        collectStrings(v, k, out);
      }
    }
  }
}

const root = path.join(process.cwd(), 'openapi/generated/zh');
const files = await walk(root);
const set = new Set();
for (const f of files) {
  const doc = JSON.parse(await readFile(f, 'utf8'));
  collectStrings(doc, null, set);
  if (Array.isArray(doc.tags)) {
    for (const t of doc.tags) {
      if (t?.name && hasCJK(t.name)) set.add(t.name);
    }
  }
  for (const pathItem of Object.values(doc.paths || {})) {
    for (const op of Object.values(pathItem)) {
      if (op && typeof op === 'object' && Array.isArray(op.tags)) {
        for (const name of op.tags) {
          if (hasCJK(name)) set.add(name);
        }
      }
    }
  }
}

const arr = [...set].sort((a, b) => b.length - a.length);
await writeFile(
  path.join(process.cwd(), 'scripts/openapi-zh-strings.json'),
  JSON.stringify({ count: arr.length, strings: arr }, null, 2),
  'utf8'
);
console.log(`files=${files.length} unique=${arr.length}`);
