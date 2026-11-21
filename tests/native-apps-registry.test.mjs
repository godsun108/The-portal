import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const registry = JSON.parse(read("native-apps/registry.json"));
const stations = JSON.parse(read("stations.json"));

test("Native Apps registry has a versioned schema and unique app IDs", () => {
  assert.equal(registry.schema, "earthchain.native-apps.v1");
  assert.equal(registry.version, 1);
  const ids = registry.apps.map((app) => app.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["maps", "weather", "clock", "notes", "journal", "library", "photos", "camera"]) {
    assert.ok(ids.includes(id), `missing required app: ${id}`);
  }
});

test("every app has evidence, a known state and an explicit data scope", () => {
  const allowed = new Set(registry.statusVocabulary);
  for (const app of registry.apps) {
    assert.ok(app.name && app.category && app.summary, `${app.id}: missing descriptive metadata`);
    assert.ok(allowed.has(app.status), `${app.id}: unknown status ${app.status}`);
    assert.ok(typeof app.dataScope === "string" && app.dataScope.length > 0, `${app.id}: missing data scope`);
    assert.ok(Array.isArray(app.permissions), `${app.id}: permissions must be an array`);
    if (app.status === "planned") assert.equal(app.entry, null, `${app.id}: planned app must not have an active link`);
  }
});

test("all registered app and related destinations resolve inside the Portal tree", () => {
  for (const app of registry.apps) {
    const links = [...(app.entry ? [app.entry] : []), ...(app.related || []).map((item) => item.href)];
    for (const href of links) {
      assert.ok(href.startsWith("../") && !href.startsWith("//"), `${app.id}: destination must be a relative same-origin path`);
      const target = path.resolve(root, "native-apps", href);
      assert.ok(target.startsWith(root + path.sep), `${app.id}: destination escaped repository root`);
      const file = path.extname(target) ? target : path.join(target, "index.html");
      assert.ok(fs.existsSync(file), `${app.id}: missing destination ${href}`);
    }
  }
});

test("Maps launcher opens the geographic preview and preserves the legacy discovery map", () => {
  const maps = registry.apps.find((app) => app.id === "maps");
  assert.ok(maps, "Maps app is missing");
  assert.equal(maps.entry, "../maps/");
  assert.equal(maps.owner.path, "maps/index.html");
  assert.ok(maps.related.some((item) => item.href === "../map/"), "legacy discovery map should remain separately reachable");
  assert.ok(maps.related.some((item) => item.href === "../maps/#cameras"), "camera directory should be linked separately");
});

test("Portal APPS station points to the registry-backed launcher", () => {
  const station = stations.stations.find((item) => item.id === "apps");
  assert.ok(station, "APPS station is missing");
  assert.ok(station.rooms.some((room) => room[1] === "native-apps/"), "APPS station does not link to native-apps/");
  assert.ok(fs.existsSync(path.join(root, "native-apps", "index.html")));
});

test("launcher uses the same-origin registry and does not inject registry strings as HTML", () => {
  const html = read("native-apps/index.html");
  assert.ok(html.includes('fetch("./registry.json"'));
  assert.ok(html.includes("textContent"));
  assert.ok(!html.includes("innerHTML"));
  assert.ok(html.includes('aria-label="Search apps"'));
});
