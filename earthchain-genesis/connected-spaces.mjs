/**
 * Genesis adapter for the EarthConnect capability registry.
 * Keeps Genesis read-only: no service calls, credentials, or trust decisions.
 */
export async function loadConnectedSpaceStatus(importer = () => import("../earthconnect/capabilities.mjs")) {
  const registry = await importer();
  if (!Array.isArray(registry.EARTHCONNECT_CAPABILITIES)) throw new Error("invalid_earthconnect_registry");
  return registry.EARTHCONNECT_CAPABILITIES.map(item => Object.freeze({
    id: item.id,
    label: item.label,
    state: item.state,
    foundation: item.foundation
  }));
}
