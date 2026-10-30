"use strict";
document.getElementById("messages").addEventListener("click",()=>{
 const detail=document.createElement("p");
 detail.setAttribute("role","status");
 detail.textContent="The existing text system has not yet been located and verified as a live private-messaging backend. No message was sent. Integration is the next step.";
 const button=document.getElementById("messages");
 button.insertAdjacentElement("afterend",detail);
 button.disabled=true;
 button.textContent="Existing text integration pending";
});