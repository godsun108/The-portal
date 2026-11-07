import { assessDevice, renderAssessment } from "./assessment.mjs";
const $ = id => document.getElementById(id);
const video = $("camera"), canvas = $("frame"), cameraStatus = $("camera-status");
let stream = null, scanActive = false, captured = false, latestProfile = null, latestAssessment = null;
function currentDevice() {
  return { category: $("kind").value, manufacturer: $("manufacturer").value.trim(), model: $("model").value.trim(), observedIdentifier: $("identifier").value.trim(), notes: $("notes").value.trim() };
}
function stopCamera() {
  scanActive = false;
  if (stream) for (const track of stream.getTracks()) track.stop();
  stream = null; video.pause(); video.srcObject = null; video.hidden = true;
  $("start-camera").disabled = false; $("capture").disabled = true; $("scan").disabled = true; $("stop-camera").disabled = true;
}
async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) throw Error("Camera access is unavailable in this browser.");
  stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } });
  video.srcObject = stream; video.hidden = false; await video.play();
  $("start-camera").disabled = true; $("capture").disabled = false; $("scan").disabled = false; $("stop-camera").disabled = false;
  cameraStatus.textContent = "Camera is active on this device. Frames stay in this page; no upload is performed.";
}
function showAssessment() {
  latestAssessment = assessDevice(currentDevice());
  $("assessment").textContent = renderAssessment(latestAssessment);
  $("assessment-status").textContent = "Preliminary assessment created locally. No device was contacted.";
  return latestAssessment;
}
$("start-camera").addEventListener("click", async () => {
  try { await startCamera(); } catch (error) { stopCamera(); cameraStatus.textContent = "Could not open camera: " + error.message; }
});
$("stop-camera").addEventListener("click", () => { stopCamera(); cameraStatus.textContent = "Camera stopped. Nothing is being recorded."; });
$("capture").addEventListener("click", () => {
  if (!stream || !video.videoWidth) return;
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext("2d", { willReadFrequently: false }).drawImage(video, 0, 0);
  captured = true;
  cameraStatus.textContent = "Frame captured locally (" + canvas.width + " × " + canvas.height + "). This prototype does not upload or interpret the image.";
  $("next-step").textContent = "Image captured. Add the visible manufacturer/model or scan a device label to create a structured profile.";
});
$("scan").addEventListener("click", async () => {
  if (!stream) return;
  if (!("BarcodeDetector" in globalThis)) { cameraStatus.textContent = "QR/barcode scanning is not supported in this browser. Enter the visible model or identifier manually."; return; }
  try {
    const formats = await BarcodeDetector.getSupportedFormats();
    const wanted = ["qr_code", "code_128", "ean_13", "ean_8", "upc_a", "upc_e"];
    const supported = wanted.filter(format => formats.includes(format));
    if (!supported.length) throw Error("No supported QR/barcode formats are available.");
    const detector = new BarcodeDetector({ formats: supported });
    scanActive = true; cameraStatus.textContent = "Scanning locally. Point the camera at a device label or QR code.";
    const scanFrame = async () => {
      if (!scanActive || !stream) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length) {
          $("identifier").value = codes[0].rawValue.slice(0, 512); scanActive = false;
          cameraStatus.textContent = "Read a " + codes[0].format + " code locally. Verify the value before using it."; return;
        }
      } catch {}
      if (scanActive) requestAnimationFrame(scanFrame);
    };
    requestAnimationFrame(scanFrame);
  } catch (error) { cameraStatus.textContent = "Scanner unavailable: " + error.message + " Enter the identifier manually."; }
});
$("assess-device").addEventListener("click", () => showAssessment());
$("build-profile").addEventListener("click", () => {
  const device = currentDevice(), assessment = latestAssessment || showAssessment();
  latestProfile = {
    schema: "genesis.sight.device-intake.v2", createdAt: new Date().toISOString(),
    capture: { imageCapturedLocally: captured, imageUploaded: false, imageInterpretedByAI: false },
    device,
    evidence: {
      manufacturer: device.manufacturer ? "user_entered_unverified" : "not_provided",
      model: device.model ? "user_entered_unverified" : "not_provided",
      observedIdentifier: device.observedIdentifier ? "locally_scanned_or_user_entered_untrusted" : "not_provided",
      visualRecognition: "not_implemented"
    },
    assessment, status: "unverified_intake",
    permissions: { connectionAuthorized: false, remoteControlAuthorized: false, resourceUseAuthorized: false },
    nextActions: assessment.nextActions
  };
  $("profile").textContent = JSON.stringify(latestProfile, null, 2);
  $("copy-profile").disabled = false;
  $("next-step").textContent = "Profile created locally. It separates user observations from verified identity and records no permissions.";
});
$("copy-profile").addEventListener("click", async () => {
  if (!latestProfile) return;
  try { await navigator.clipboard.writeText(JSON.stringify(latestProfile, null, 2)); $("next-step").textContent = "Device-intake profile copied."; }
  catch { $("next-step").textContent = "Clipboard unavailable. Select and copy the profile JSON manually."; }
});
window.addEventListener("pagehide", () => { stopCamera(); canvas.width = 0; canvas.height = 0; });
