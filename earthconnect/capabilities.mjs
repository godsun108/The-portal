/**
 * EarthConnect capability registry.
 * Describes verified local routes and integration readiness; it does not
 * claim that a route is a live backend or that a preview delivers messages.
 */
export const EARTHCONNECT_CAPABILITIES = Object.freeze([
  Object.freeze({ id: "messages", label: "Messages", state: "integration-pending", route: null, foundation: "Existing text backend not yet verified" }),
  Object.freeze({ id: "presence", label: "CAMPFIRE presence", state: "reference-service", route: "../connection/", foundation: "Temporary presence leases only" }),
  Object.freeze({ id: "voice", label: "EarthCall", state: "not-connected", route: null, foundation: "No person-to-person calling service verified" }),
  Object.freeze({ id: "video", label: "Video Call", state: "not-connected", route: null, foundation: "No production media/signaling path verified" }),
  Object.freeze({ id: "rooms", label: "Rooms", state: "planned", route: null, foundation: "Group conversation service not verified" }),
  Object.freeze({ id: "identity", label: "Connections", state: "not-connected", route: null, foundation: "No verified account/contact identity provider" }),
  Object.freeze({ id: "mesh", label: "EarthMesh", state: "experimental", route: null, foundation: "Experimental peer signaling is not a secure mesh network" })
]);

export function getCapability(id) {
  return EARTHCONNECT_CAPABILITIES.find(item => item.id === id) ?? null;
}

export function capabilityIsLaunchable(item) {
  return Boolean(item && item.state === "available" && item.route);
}
