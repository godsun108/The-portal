// EarthChain SPATIAL scene contract v0.1. No device or network dependencies.
export const SCENE_VERSION = "0.1";
const finite = n => typeof n === "number" && Number.isFinite(n);
const vec = (v, fallback) => Array.isArray(v) && v.length === 3 && v.every(finite) ? [...v] : [...fallback];
export function normalizeScene(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("scene must be an object");
  if (input.objects != null && !Array.isArray(input.objects)) throw new TypeError("objects must be an array");
  const ids = new Set();
  const objects = (input.objects || []).map((o, index) => {
    if (!o || typeof o !== "object" || Array.isArray(o)) throw new TypeError("invalid object");
    const id = o.id;
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(id) || ids.has(id)) throw new TypeError("invalid or duplicate object id");
    ids.add(id);
    const scale = finite(o.scale) && o.scale > 0 ? Math.min(o.scale, 1000) : 1;
    return {id, label: typeof o.label === "string" ? o.label.slice(0, 160) : id,
      position: vec(o.position, [0,0,0]), rotation: vec(o.rotation, [0,0,0]),
      scale, visible: o.visible !== false, interactive: o.interactive !== false,
      kind: ["primitive","model","annotation"].includes(o.kind) ? o.kind : "primitive"};
  });
  if (objects.length > 500) throw new RangeError("scene object limit exceeded");
  return {version: SCENE_VERSION, id: typeof input.id === "string" ? input.id.slice(0,80) : "scene",
    units: "meters", objects};
}
export function sceneEvent(scene, event) {
  const normalized = normalizeScene(scene);
  if (!event || typeof event !== "object" || !["select","move","show","hide"].includes(event.type)) throw new TypeError("unsupported event");
  const object = normalized.objects.find(o => o.id === event.objectId);
  if (!object) throw new RangeError("unknown object");
  if (!object.interactive && event.type !== "show" && event.type !== "hide") throw new RangeError("object not interactive");
  if (event.type === "move") {
    if (!Array.isArray(event.position) || event.position.length !== 3 || !event.position.every(finite)) throw new TypeError("invalid position");
    object.position = [...event.position];
  }
  if (event.type === "show") object.visible = true;
  if (event.type === "hide") object.visible = false;
  return {scene: normalized, event: {type: event.type, objectId: object.id}};
}
export function fromXRObjects(objects = []) {
  return normalizeScene({id:"portal-xr", objects: objects.map(o=>({id:o.id, position:[o.position?.x??0,o.position?.y??0,o.position?.z??0], scale:o.scale, interactive:o.grabbable!==false}))});
}
