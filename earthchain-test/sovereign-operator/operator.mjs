import {createLocalBridge,parseSignal,sdpFingerprint} from "./local-bridge.mjs";
import {createPeerApproval} from "./peer-approval.mjs";
import {createExecutionClient} from "./sovereign-execution-bridge.mjs";

if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("./sw.js").catch(()=>{});

const $=id=>document.getElementById(id);
const peerApproval=createPeerApproval();
let bridge=null,channel=null,client=null,hostId="";
const capabilities=["workspace.list","workspace.read","command.run"];
const buttons=["list-workspace","read-file","run-command"].map($);
function status(message){$("connection-status").textContent=message;}
function executionStatus(message){$("execution-status").textContent=message;}
function updateButtons(){
 const ready=Boolean(client&&peerApproval.approved&&channel?.readyState==="open");
 for(const button of buttons)button.disabled=!ready;
}
function onChannelReady(dataChannel){
 channel=dataChannel;
 dataChannel.addEventListener("message",event=>{
  if(typeof event.data!=="string"||event.data.length>4096)return;
  let message;try{message=JSON.parse(event.data);}catch{return;}
  if(message?.schema!=="sovereign.execution.host.v1"||
     typeof message.deviceId!=="string"||!/^host_[A-Fa-f0-9]{48}$/.test(message.deviceId)||
     !Array.isArray(message.capabilities)||!message.capabilities.every(x=>capabilities.includes(x)))return;
  hostId=message.deviceId;
  client?.close();
  client=createExecutionClient({channel,deviceId:hostId});
  executionStatus("Desktop host discovered. Verify its fingerprint and approve the peer before requesting work.");
  updateButtons();
 });
 dataChannel.addEventListener("open",()=>status("WebRTC data channel open. Verify the desktop fingerprint before approving."));
 dataChannel.addEventListener("close",()=>{
  client?.close();client=null;hostId="";
  status("Connection closed.");executionStatus("Desktop host disconnected.");updateButtons();
 });
 if(dataChannel.readyState==="open")status("WebRTC data channel open. Verify the desktop fingerprint before approving.");
}
async function copy(text){
 if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}
 throw Error("Clipboard unavailable. Select and copy the offer manually.");
}
$("create-offer").addEventListener("click",async()=>{
 try{
  client?.close();client=null;hostId="";peerApproval.revoke();updateButtons();
  bridge?.close();channel=null;
  bridge=createLocalBridge({onChannel:onChannelReady,onStatus:s=>status("Peer connection: "+s)});
  const offer=await bridge.offer();
  $("signal-out").value=offer;
  $("own-fingerprint").textContent=sdpFingerprint(parseSignal(offer,"offer").sdp);
  status("Offer created. Copy it to the desktop host and paste the desktop answer here.");
 }catch(error){status("Could not create offer: "+error.message);}
});
$("copy-offer").addEventListener("click",async()=>{
 try{await copy($("signal-out").value);status("Phone offer copied. Send it directly to your desktop.");}
 catch(error){status(error.message);}
});
$("accept-answer").addEventListener("click",async()=>{
 try{
  if(!bridge)throw Error("Create the phone offer first.");
  const answer=parseSignal($("signal-in").value.trim(),"answer");
  $("peer-fingerprint").textContent=sdpFingerprint(answer.sdp);
  peerApproval.present(sdpFingerprint(answer.sdp));
  $("approve-peer").disabled=false;
  await bridge.acceptAnswer($("signal-in").value.trim());
  status("Desktop answer accepted. Waiting for direct connection. Verify the fingerprint independently.");
 }catch(error){status("Answer rejected: "+error.message);}
});
$("approve-peer").addEventListener("click",()=>{
 try{
  peerApproval.approve($("verified-fingerprint").value.trim().toUpperCase());
  status("Desktop fingerprint approved for this connection.");
  executionStatus(hostId?"Desktop host approved. You can request the listed capabilities.":"Peer approved; waiting for the desktop host capability announcement.");
  updateButtons();
 }catch{status("Fingerprint mismatch. Compare the complete fingerprint through a separate trusted channel.");}
});
async function request(capability,input){
 if(!client||!peerApproval.approved||channel?.readyState!=="open"){
  executionStatus("Connect to the desktop and approve its fingerprint first.");return;
 }
 executionStatus("Request sent. Waiting for desktop owner approval and execution…");
 try{
  const result=await client.request({capability,input});
  $("receipt").textContent=JSON.stringify(result,null,2);
  executionStatus(result.status==="succeeded"?"Desktop returned an execution receipt.":"Desktop rejected the request: "+(result.reason||"unknown"));
 }catch(error){executionStatus("Request failed: "+error.message);}
}
$("list-workspace").addEventListener("click",()=>request("workspace.list",{path:$("workspace-path").value}));
$("read-file").addEventListener("click",()=>request("workspace.read",{path:$("read-path").value}));
$("run-command").addEventListener("click",()=>{
 let args;try{args=JSON.parse($("arguments").value);}catch{executionStatus("Arguments must be a valid JSON array.");return;}
 request("command.run",{command:$("command").value,args,cwd:$("working-directory").value});
});
window.addEventListener("pagehide",()=>{client?.close();bridge?.close();peerApproval.revoke();});
