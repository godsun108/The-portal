import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../maps/camera-sources.json", import.meta.url), "utf8"));
const page = await readFile(new URL("../maps/index.html", import.meta.url), "utf8");

test("camera registry has a versioned schema and unique source IDs", () => {
  assert.equal(manifest.schema, "earthchain.maps.camera-sources.v1");
  assert.equal(manifest.version, 1);
  const ids = manifest.sources.map(x => x.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length >= 1);
});

test("camera records do not claim live status or unverified coordinates", () => {
  for (const source of manifest.sources) {
    assert.equal(source.status, "unknown");
    assert.equal(source.coordinates, null);
    assert.ok(source.provider && source.url && source.access);
  }
});

test("Maps requests location only from an explicit user action", () => {
  assert.match(page, /id="locate"/);
  assert.match(page, /getCurrentPosition/);
  assert.doesNotMatch(page, /watchPosition/);
  assert.doesNotMatch(page, /getCurrentPosition\([^)]*\);/);
});

test("saved places are browser-local and map rendering avoids HTML injection", () => {
  assert.match(page, /earthchain\.maps\.saved\.v1/);
  assert.match(page, /textContent/);
  assert.doesNotMatch(page, /innerHTML\s*=/);
});

test("external provider links use safe browsing attributes", () => {
  assert.match(page, /target="_blank"/);
  assert.match(page, /rel="noopener"/);
});
