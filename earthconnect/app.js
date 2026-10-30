"use strict";

import("./capabilities.mjs").then(({ getCapability }) => {
 const messages = getCapability("messages");
 const status = document.querySelector("#messages")?.closest(".tile")?.querySelector(".state");
 if (status && messages) status.textContent = messages.foundation;
}).catch(() => {
 const status = document.querySelector("#messages")?.closest(".tile")?.querySelector(".state");
 if (status) status.textContent = "Readiness registry unavailable; messaging integration not verified";
});

document.getElementById("messages").addEventListener("click", () => {
 const detail = document.createElement("p");
 detail.setAttribute("role", "status");
 detail.textContent = "No verified private-messaging backend is connected yet. No message was sent. The next step is to identify and integrate the existing text system.";
 const button = document.getElementById("messages");
 button.insertAdjacentElement("afterend", detail);
 button.disabled = true;
 button.textContent = "Messaging integration pending";
});
