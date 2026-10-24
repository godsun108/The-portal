#!/usr/bin/env node
// Read-only verification of an extracted USFM edition. No text is rewritten or published.
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const folder = process.argv[2];
if (!folder) {
  console.error('Usage: node scripts/audit-web-usfm.mjs <directory-containing-extracted-USFM>');
  process.exit(2);
}
const root = resolve(folder);
async function filesIn(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const full = join(folder, entry.name);
    if (entry.isDirectory()) output.push(...await filesIn(full));
    else if (entry.isFile() && /\.(?:usfm|sfm)$/i.test(entry.name)) output.push(full);
  }
  return output;
}
function audit(text, file) {
  const id = text.match(/^\\id\s+(\S+)/m)?.[1];
  if (!id || !/^[A-Z0-9]{3,4}$/.test(id)) throw Error(file + ': missing/invalid USFM \\id');
  const chapterMarkers = [...text.matchAll(/^\\c\s+(\d+)\s*$/gm)].map(x => Number(x[1]));
  if (!chapterMarkers.length) throw Error(file + ': no chapters');
  if (chapterMarkers.some((n, i) => n !== i + 1)) throw Error(file + ': chapters must be consecutive from 1');
  const verseMarkers = [...text.matchAll(/^\\v\s+(\d+(?:[-,]\d+)*)\b/gm)];
  if (!verseMarkers.length) throw Error(file + ': no verse markers');
  return { id, chapters: chapterMarkers.length, verse_markers: verseMarkers.length };
}
try {
  const files = await filesIn(root);
  if (!files.length) throw Error('No .usfm/.sfm files found');
  const books = [];
  const ids = new Set();
  for (const file of files.sort()) {
    const raw = await readFile(file);
    const text = raw.toString('utf8');
    const result = audit(text, file);
    if (ids.has(result.id)) throw Error('Duplicate book id: ' + result.id);
    ids.add(result.id);
    books.push({ ...result, filename: file.slice(root.length + 1), bytes: raw.length, sha256: createHash('sha256').update(raw).digest('hex') });
  }
  const output = { status: 'source-structure-audited-not-published', checked_at: new Date().toISOString(), files: books.length, chapters: books.reduce((a,b)=>a+b.chapters,0), verse_markers: books.reduce((a,b)=>a+b.verse_markers,0), books };
  console.log(JSON.stringify(output, null, 2));
} catch (e) { console.error('SOURCE AUDIT FAILED:', e.message); process.exitCode = 1; }
