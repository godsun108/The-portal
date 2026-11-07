const $=id=>document.getElementById(id);
const yes=value=>value?"Available":"Not detected";
const api={
 "Camera API":!!navigator.mediaDevices?.getUserMedia,
 "Microphone API":!!navigator.mediaDevices?.getUserMedia,
 "WebRTC":!!globalThis.RTCPeerConnection,
 "Web Bluetooth":!!navigator.bluetooth,
 "WebUSB":!!navigator.usb,
 "Web Serial":!!navigator.serial,
 "Barcode scanning":!!globalThis.BarcodeDetector,
 "File System Access":!!globalThis.showOpenFilePicker,
 "Web Workers":!!globalThis.Worker,
 "Service workers":!!navigator.serviceWorker,
 "Web Crypto":!!globalThis.crypto?.subtle,
 "WebGPU":!!navigator.gpu,
 "WebAssembly":!!globalThis.WebAssembly,
 "WebXR":!!navigator.xr
};
function buildReport(){
 const ua=navigator.userAgentData;
 const report={
  schema:"genesis.device-capability-card.v1",
  createdAt:new Date().toISOString(),
  collection:"local_browser_feature_detection_no_permission_requests",
  network:{browserReportsOnline:navigator.onLine,meaning:"navigator.onLine is only a browser network hint; it does not prove internet access"},
  browser:{
   userAgent:navigator.userAgent,
   platform:ua?.platform||navigator.platform||"unknown",
   mobile:ua?.mobile??null,
   language:navigator.language||"unknown",
   secureContext:!!isSecureContext
  },
  hardware:{
   logicalCpuCores:navigator.hardwareConcurrency||null,
   approximateDeviceMemoryGiB:navigator.deviceMemory||null,
   maxTouchPoints:navigator.maxTouchPoints||0
  },
  storage:{localStorageAvailable:canUseStorage(),serviceWorkerAvailable:!!navigator.serviceWorker},
  interfaces:api,
  permissionRequestsMade:false,
  filesRead:false,
  cameraOrMicrophoneOpened:false,
  dataUploaded:false,
  limitations:["Browser feature detection is not proof that a physical device is attached.","Browser APIs remain permission- and policy-gated.","A web page cannot inspect arbitrary files, install native software, or run unrestricted operating-system commands."]
 };
 return report;
}
function canUseStorage(){try{const key="genesis-arrival-test";localStorage.setItem(key,"1");localStorage.removeItem(key);return true;}catch{return false;}}
function card(name,value,description=""){
 const el=document.createElement("div");el.className="item";
 const strong=document.createElement("strong");strong.textContent=name;
 const val=document.createElement("div");val.className="value";val.textContent=value;
 el.append(strong,val);
 if(description){const note=document.createElement("p");note.textContent=description;note.style.marginBottom="0";el.append(note);}
 return el;
}
async function render(){
 const report=buildReport();
 $("capabilities").replaceChildren(
  card("Offline app shell",navigator.serviceWorker?"Service worker API available":"Service worker API unavailable"),
  card("Secure context",isSecureContext?"Yes":"No — some device APIs are restricted"),
  card("Browser network hint",navigator.onLine?"Online-reported":"Offline-reported"),
  card("CPU threads",String(report.hardware.logicalCpuCores??"Not reported")),
  card("Approximate memory",report.hardware.approximateDeviceMemoryGiB?report.hardware.approximateDeviceMemoryGiB+" GiB":"Not reported"),
  card("Touch points",String(report.hardware.maxTouchPoints))
 );
 $("details").replaceChildren(...Object.entries(api).map(([name,value])=>card(name,yes(value))));
 $("limits").textContent="Detection tells us which browser interfaces exist. It does not prove a camera, radio, GPU, or other peripheral is physically present, nor does it grant access. The device owner must approve each permission.";
 $("overall").textContent="Local assessment complete. No permissions requested and no data sent.";
 $("report").textContent=JSON.stringify(report,null,2);
 try{
  if("serviceWorker" in navigator && location.protocol==="https:"){
   await navigator.serviceWorker.register("./sw.js");
   $("export-status").textContent="Offline app support is registered. The first successful load needs a connection to cache the files; later launches can use the cached app shell.";
  }
 }catch(error){$("export-status").textContent="Service worker registration unavailable: "+error.message;}
}
$("refresh").addEventListener("click",render);
$("export").addEventListener("click",()=>{
 const blob=new Blob([JSON.stringify(buildReport(),null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="genesis-device-card.json";a.click();URL.revokeObjectURL(url);
 $("export-status").textContent="Device card exported locally. Review it before sharing.";
});
render();
