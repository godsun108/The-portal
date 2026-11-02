(() => {
  "use strict";
  // Capture the script URL while currentScript is available. The shared loader
  // can run in the document head before <body> exists, so mount only after DOM
  // readiness when necessary.
  const scriptUrl = document.currentScript && document.currentScript.src;
  const mount = () => {
    if (window.__portalGenesisDock || !document.body || !document.head) return;
    window.__portalGenesisDock = true;
    const root = new URL("./", scriptUrl || location.href);
  const ai = new URL("intelligence/", root);
  const page = new URL(location.href);
  ai.searchParams.set("source", page.pathname);
  ai.searchParams.set("title", document.title || "Portal");
  const style = document.createElement("style");
  style.textContent = `
    #genesis-dock-button{position:fixed;z-index:2147483000;right:max(16px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));width:58px;height:58px;border-radius:50%;border:1px solid #8de4bd;background:#102d27;color:#c8ffe3;box-shadow:0 8px 28px #0008;font:700 22px system-ui;cursor:pointer}
    #genesis-dock-panel{position:fixed;z-index:2147483001;inset:0 0 0 auto;width:min(440px,100vw);height:100dvh;background:#07130f;border-left:1px solid #386455;box-shadow:-18px 0 50px #0009;display:none}
    #genesis-dock-panel[data-open="true"]{display:grid;grid-template-rows:54px 1fr}
    #genesis-dock-head{display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:#d8ffeb;font:12px system-ui;letter-spacing:.08em;border-bottom:1px solid #28473c}
    #genesis-dock-close{border:1px solid #547c6a;background:#10251e;color:#eafff2;border-radius:10px;padding:8px 12px;font:inherit}
    #genesis-dock-frame{width:100%;height:100%;border:0;background:#050507}
    @media(min-width:700px){#genesis-dock-panel{inset:0 0 0 auto;width:min(480px,92vw)}}
  `;
  document.head.append(style);
  const button = document.createElement("button");
  button.id = "genesis-dock-button";
  button.type = "button";
  button.textContent = "◇";
  button.setAttribute("aria-label", "Open Genesis AI");
  button.title = "Talk to Genesis";
  const panel = document.createElement("section");
  panel.id = "genesis-dock-panel";
  panel.setAttribute("aria-label", "Genesis AI");
  panel.dataset.open = "false";
  const head = document.createElement("header");
  head.id = "genesis-dock-head";
  const label = document.createElement("strong");
  label.textContent = "GENESIS // ALWAYS WITHIN REACH";
  const close = document.createElement("button");
  close.id = "genesis-dock-close";
  close.type = "button";
  close.textContent = "Close";
  close.setAttribute("aria-label", "Close Genesis");
  const frame = document.createElement("iframe");
  frame.id = "genesis-dock-frame";
  frame.title = "Genesis conversation";
  frame.loading = "lazy";
  frame.src = ai.toString();
  head.append(label, close);
  panel.append(head, frame);
  const setOpen = value => {
    panel.dataset.open = String(value);
    button.setAttribute("aria-expanded", String(value));
    if (value) close.focus(); else button.focus();
  };
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => setOpen(panel.dataset.open !== "true"));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && panel.dataset.open === "true") setOpen(false); });
    document.body.append(button, panel);
  };
  if (document.body && document.head) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
})();