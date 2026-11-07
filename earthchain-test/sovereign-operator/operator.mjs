import {createLocalBridge,parseSignal,sdpFingerprint} from "./local-bridge.mjs";
import {createPeerApproval} from "./peer-approval.mjs";
import {createExecutionClient} from "./sovereign-execution-bridge.mjs";
import {createPairingCode,inspectPairingCode} from "./pairing-code.mjs";
import {makeInviteLink} from "./invite-link.mjs";
import {createBridgeIdentity,signBridgeOffer} from "./signed-bridge-offer.mjs";
import {verifyBridgeAnswer} from "./signed-bridge-answer.mjs";

if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("./sw.js").catch(()=>{});

const $=id=>document.getElementById(id);
const peerApproval=createPeerApproval();
let bridge=null,channel=null,client=null,hostId="",bridgeIdentity=null,currentInvitation="",currentInviteLink="",activeSignedOffer="";
const hex=bytes=>Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
const capabilities=["workspace.list","workspace.read","command.run"];
const buttons=["list-workspace","read-file","run-command"].map($);
function status(message){$("connection-status").textContent=message;}
function executionStatus(message){$("execution-status").textContent=message;}
$("create-invite").addEventListener("click",async()=>{
 try{
  currentInvitation="";currentInviteLink="";bridgeIdentity=null;activeSignedOffer="";$("invite-qr").replaceChildren();$("invite-link").textContent="No invitation created.";
  if(!globalThis.crypto?.subtle||!globalThis.crypto?.getRandomValues)throw Error("Secure browser context required.");
  client?.close();client=null;hostId="";peerApproval.revoke();updateButtons();bridge?.close();bridge=null;channel=null;activeSignedOffer="";
  bridgeIdentity=await createBridgeIdentity();
  const nonce=hex(crypto.getRandomValues(new Uint8Array(24)));
  currentInvitation=await createPairingCode({publicKey:bridgeIdentity.publicKey,nonce});
  currentInviteLink=makeInviteLink($("desktop-url").value.trim(),currentInvitation);
  const qr=$("invite-qr");qr.replaceChildren();
  if(typeof QRCode!=="function")throw Error("QR renderer unavailable. Copy the invitation link instead.");
  new QRCode(qr,{text:currentInviteLink,width:240,height:240,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.L});
  $("invite-link").textContent=currentInviteLink;
  $("invite-status").textContent="Fresh two-minute invitation created. Show this QR to the desktop Web OS and use its Scan QR invitation control. It grants no access by itself.";
 }catch(error){$("invite-status").textContent="Could not create invitation: "+(error.message||"unknown error");}
});
$("copy-invite").addEventListener("click",async()=>{
 if(!currentInviteLink)return;
 try{await navigator.clipboard.writeText(currentInviteLink);$("invite-status").textContent="Invitation link copied. Paste it into the desktop Web OS invitation field; do not open it on this iPhone."; }
 catch{$("invite-status").textContent="Clipboard unavailable. Select and copy the invitation link manually."; }
});
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
  bridge?.close();channel=null;activeSignedOffer="";
  bridge=createLocalBridge({onChannel:onChannelReady,onStatus:s=>status("Peer connection: "+s)});
  const offer=await bridge.offer();
  if(currentInvitation)inspectPairingCode(currentInvitation);
  const outgoing=currentInvitation&&bridgeIdentity?await signBridgeOffer({invitation:currentInvitation,offer,identity:bridgeIdentity}):offer;
  if(currentInvitation&&bridgeIdentity){activeSignedOffer=outgoing;$("invite-status").textContent="Invitation-bound signed offer created. Paste it into the desktop Web OS after it scans this phone QR. Invitation expires after two minutes.";}
  $("signal-out").value=outgoing;
  $("own-fingerprint").textContent=sdpFingerprint(parseSignal(offer,"offer").sdp);
  status(activeSignedOffer?"Signed phone offer created. Send it only to the desktop that scanned your current invitation.":"Unsigned offer created. Copy it to the desktop host and paste the desktop answer here.");
 }catch(error){status("Could not create offer: "+error.message);}
});
$("copy-offer").addEventListener("click",async()=>{
 try{await copy($("signal-out").value);status("Phone offer copied. Send it directly to your desktop.");}
 catch(error){status(error.message);}
});
$("accept-answer").addEventListener("click",async()=>{
 try{
  if(!bridge)throw Error("Create the phone offer first.");
  let answerText=$("signal-in").value.trim();
  if(activeSignedOffer){const checked=await verifyBridgeAnswer(answerText,{invitation:currentInvitation,signedOffer:activeSignedOffer});answerText=checked.answer;}
  else if(JSON.parse(answerText)?.schema==="earthchain.bridge.signed-answer.v0")throw Error("Signed answer requires the matching active phone invitation and offer.");
  const answer=parseSignal(answerText,"answer");
  $("peer-fingerprint").textContent=sdpFingerprint(answer.sdp);
  peerApproval.present(sdpFingerprint(answer.sdp));
  $("approve-peer").disabled=false;
  await bridge.acceptAnswer(answerText);
  status(activeSignedOffer?"Signed answer verified for this invitation and offer. Waiting for direct connection; independently verify the DTLS fingerprint.":"Desktop answer accepted. Waiting for direct connection. Verify the fingerprint independently.");
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
