import test from "node:test";
import assert from "node:assert/strict";
import { assessDevice, renderAssessment } from "./assessment.mjs";

test("unknown devices remain unverified and receive identify-first guidance", () => {
  const result = assessDevice({ category: "not-a-real-category" }, { isSecureContext: false, navigator: {} });
  assert.equal(result.deviceCategory, "other");
  assert.equal(result.identity.verified, false);
  assert.equal(result.status, "preliminary_assessment");
  assert.equal(result.methods[0].id, "identify-first");
  assert.equal(result.environment.secureContext, false);
});

test("browser APIs are reported as available without claiming target compatibility", () => {
  const result = assessDevice(
    { category: "embedded", manufacturer: "Example", model: "Board 1" },
    { isSecureContext: true, RTCPeerConnection() {}, navigator: { serial: {}, usb: {}, bluetooth: {} } }
  );
  assert.equal(result.identity.manufacturerAndModelProvided, true);
  assert.equal(result.identity.verified, false);
  assert.equal(result.methods.find(method => method.id === "web-serial").browserStatus, "browser_api_available");
  assert.ok(result.restrictions.some(item => item.includes("does not prove the target device supports")));
});

test("rendering produces a readable JSON profile", () => {
  const result = assessDevice({ category: "computer" }, { isSecureContext: true, navigator: {} });
  assert.deepEqual(JSON.parse(renderAssessment(result)), result);
});
