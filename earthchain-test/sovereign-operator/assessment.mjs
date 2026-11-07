const CATEGORY_GUIDANCE = {
  computer: [
    ["sovereign-webrtc-host", "Supported Sovereign desktop host", "requires_owned_desktop_agent", "Best route for an authorized computer with the Sovereign host installed and running."],
    ["web-serial", "USB / serial", "browser_api_dependent", "Useful for supported development boards and serial consoles; requires a user-selected port."],
    ["web-usb", "USB device", "browser_api_dependent", "Only works with devices and protocols exposed to the browser; not general computer control."]
  ],
  phone: [
    ["sovereign-webrtc-host", "Sovereign companion session", "requires_owned_companion", "A companion app or supported local agent is required; camera recognition alone cannot pair a phone."],
    ["qr-pairing", "QR-assisted pairing", "requires_signed_pairing_flow", "A future QR challenge can bootstrap pairing after the target verifies a short-lived signed challenge."]
  ],
  display: [
    ["vendor-cast", "AirPlay / Google Cast / vendor API", "requires_native_or_vendor_support", "Use the display's supported receiver or vendor integration; generic browser discovery is not guaranteed."],
    ["sovereign-webrtc-host", "Browser-based companion", "requires_supported_browser", "Possible only if the display runs a supported browser and an explicitly approved companion."]
  ],
  network: [
    ["vendor-management", "Router / network management API", "requires_owner_configured_integration", "Use documented owner-authorized management interfaces; do not guess credentials or scan networks."],
    ["sovereign-webrtc-host", "Local Sovereign node", "requires_owned_agent", "A configured local node can provide a narrow, auditable management bridge."]
  ],
  audio: [
    ["vendor-cast", "AirPlay / Cast / vendor API", "requires_native_or_vendor_support", "Use a supported receiver or vendor integration."],
    ["web-bluetooth", "Bluetooth LE", "browser_api_dependent", "Browser BLE support is limited and does not provide generic audio streaming."]
  ],
  embedded: [
    ["web-serial", "USB / serial", "browser_api_dependent", "Often the most practical route for supported development boards; requires user selection."],
    ["web-usb", "USB device", "browser_api_dependent", "Requires a compatible device interface and explicit browser permission."],
    ["web-bluetooth", "Bluetooth LE", "browser_api_dependent", "Only for devices exposing a compatible GATT service."]
  ],
  wearable: [
    ["web-bluetooth", "Bluetooth LE", "browser_api_dependent", "Requires a compatible GATT service and browser support."],
    ["vendor-companion", "Manufacturer companion API", "requires_vendor_support", "Usually needs the manufacturer's supported app or integration."]
  ],
  vehicle: [
    ["oem-integration", "OEM-supported integration", "requires_oem_authorization", "Use only documented, safe, owner-authorized interfaces; no vehicle control is attempted."],
    ["diagnostic-adapter", "Diagnostic adapter", "requires_user_selected_adapter", "Read-only diagnostics may be possible with a compatible adapter and explicit authorization."]
  ],
  "smart-home": [
    ["matter-controller", "Matter / Thread controller", "requires_authorized_controller", "Requires an authorized Matter controller or supported vendor bridge."],
    ["web-bluetooth", "Bluetooth LE", "browser_api_dependent", "Only for compatible GATT devices and supported browsers."],
    ["vendor-api", "Manufacturer API", "requires_owner_configured_integration", "Use documented owner-configured integrations."]
  ],
  other: [
    ["identify-first", "Identify exact model", "manual_verification_required", "Confirm the model and supported interface before selecting a connection method."]
  ]
};

function apiStatus(method, environment) {
  const nav = environment.navigator || {};
  if (method === "web-bluetooth") return nav.bluetooth ? "browser_api_available" : "not_exposed_in_this_browser";
  if (method === "web-usb") return nav.usb ? "browser_api_available" : "not_exposed_in_this_browser";
  if (method === "web-serial") return nav.serial ? "browser_api_available" : "not_exposed_in_this_browser";
  if (method === "sovereign-webrtc-host") return typeof environment.RTCPeerConnection === "function" ? "browser_webrtc_available_host_required" : "browser_api_unavailable";
  return "integration_required";
}

export function assessDevice(device, environment = globalThis) {
  const category = CATEGORY_GUIDANCE[device?.category] ? device.category : "other";
  const methods = CATEGORY_GUIDANCE[category].map(([id, label, requirement, rationale]) => ({
    id, label, requirement, browserStatus: apiStatus(id, environment), rationale
  }));
  const identityComplete = Boolean(String(device?.manufacturer || "").trim() && String(device?.model || "").trim());
  return {
    schema: "genesis.sight.connection-assessment.v1",
    assessedAt: new Date().toISOString(),
    status: "preliminary_assessment",
    deviceCategory: category,
    identity: {
      manufacturerAndModelProvided: identityComplete,
      verified: false,
      note: identityComplete
        ? "Manufacturer and model were entered by the user; they have not been independently verified."
        : "Exact manufacturer and model are incomplete. Treat all compatibility guidance as provisional."
    },
    environment: {
      secureContext: Boolean(environment.isSecureContext),
      webRtc: typeof environment.RTCPeerConnection === "function",
      webBluetooth: Boolean(environment.navigator?.bluetooth),
      webUsb: Boolean(environment.navigator?.usb),
      webSerial: Boolean(environment.navigator?.serial)
    },
    methods,
    restrictions: [
      "No device was contacted, scanned, paired, controlled, or modified.",
      "Browser API availability does not prove the target device supports that API.",
      "A QR code or barcode is untrusted observed data, not proof of identity or authorization.",
      "Pairing requires a separate authenticated challenge, independent device verification, and explicit owner approval."
    ],
    nextActions: identityComplete
      ? ["verify_model_against_manufacturer_documentation", "select_one_supported_connection_method", "design_authenticated_pairing_challenge"]
      : ["confirm_manufacturer_and_exact_model", "inspect_ports_and_supported_protocols", "repeat_assessment"]
  };
}

export function renderAssessment(assessment) {
  return JSON.stringify(assessment, null, 2);
}
