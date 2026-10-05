const fs=require("fs"),assert=require("assert");
function read(p){return fs.readFileSync(p,"utf8")}
const earth=read("./earth/index.html"),win=read("./window/index.html"),arcade=read("./arcade/index.html"),pulse=read("./pulse/index.html");
assert(!earth.includes("portal_build="),"Earth wrapper must not pin a stale build");
assert(earth.includes("https://godsun108.github.io/earth-now/"),"Earth uses canonical instrument");
assert(earth.includes("https://window-earth-production.up.railway.app"),"Earth handoff accepts canonical Window");
assert(!earth.includes("window-node-production"),"Earth contains no deprecated Window service");
assert(win.includes("https://window-earth-production.up.railway.app/"),"Window wrapper uses canonical service");
assert(!win.includes("window-node-production"),"Window contains no deprecated service");
for(const marker of ['data-g="life"','data-g="moon"','data-g="button"'])assert(arcade.includes(marker),marker+" remains mounted in Arcade");
assert(arcade.includes(".stage.open{display:grid!important"),"Arcade native stage has a visible-open invariant");
assert(!arcade.includes('id="stage" hidden'),"Arcade native stage must not depend on the hidden attribute");
assert(arcade.includes('stage.style.setProperty("display","grid","important")'),"Arcade open path explicitly reveals the stage");
assert(pulse.includes("earth-now/dynamic/latest.json"),"Pulse reads canonical Earth snapshot");
const stations=JSON.parse(read("./stations.json"));
for(const station of stations.stations)for(const room of station.rooms){const href=room[1];if(href.startsWith("#")||/^https?:/.test(href))continue;const clean="./"+href.replace(/^\.\//,"").replace(/\/$/,"");const p=/\.html?(?:[?#].*)?$/i.test(clean)?clean.split(/[?#]/)[0]:clean+"/index.html";assert(fs.existsSync(p),"Missing station destination: "+station.id+" / "+room[0]+" -> "+p)}
for(const p of ["./index.html","./earth/index.html","./window/index.html","./arcade/index.html","./pulse/index.html"]){const s=read(p);assert(!s.includes("window-node-production"),p+" contains stale Window domain");assert(!s.includes("portal-arcade-unlocked"),p+" contains deprecated Arcade key")}
console.log("Portal experience contracts passed.");

// Cache/deployment regression sentinels: these stale identifiers previously served broken production code.
assert(!earth.includes("20260928-4"),"Earth wrapper must not reintroduce stale 20260928-4 build identifiers");
assert(!win.includes("window-node-production"),"Window wrapper must not reintroduce deprecated Railway service");

// PORTAL TV autonomous open-entertainment seam
const portalTV=read("./tv.html"),openCurator=read("./tv-open-curator.cjs"),openCandidates=JSON.parse(read("./tv-open-candidates.json"));
assert(portalTV.includes("tv-open-library.json")&&portalTV.includes("const existing=new Set"),"PORTAL TV must consume curated open library with duplicate protection");
assert(openCurator.includes('rightsStatus==="verified_open"')&&openCurator.includes("allowedLicenses"),"Open curator must gate admission on explicit rights state and license allowlist");
assert(openCurator.includes("rightsSource")&&openCurator.includes("attribution required"),"Open curator must require provenance and attribution where applicable");
assert(["portal.tv.open-candidates.v1","portal.tv.open-candidates.v2"].includes(openCandidates.schema)&&openCandidates.items.length>=10,"Open entertainment candidate registry must remain explicit and seeded");\nif(openCandidates.schema==="portal.tv.open-candidates.v2")assert(openCandidates.items.every(x=>Number.isInteger(x.year)&&x.format&&Array.isArray(x.themes)&&x.themes.length&&Array.isArray(x.channelTags)&&x.channelTags.length),"V2 open entertainment candidates must carry complete programming metadata");

const tvDirector=read("./tv-programming-director.js");
assert(tvDirector.includes("tv-open-library.json")&&tvDirector.includes("rights-verified open"),"Programming Director must surface the autonomous open library with explicit rights labeling");
assert(tvDirector.includes("kind:'open'")&&tvDirector.includes("Watch in Portal"),"Rights-admitted open entertainment must be directly discoverable as in-Portal programming");

const tvNetwork=read("./tv-network.js"),tvShell=read("./tv.html");
assert(tvShell.includes('id="portalNetwork"')&&tvShell.includes("tv-network.js?v=1"),"PORTAL TV must expose the virtual network surface");
assert(tvNetwork.includes("rightsStatus==='verified_open'")&&tvNetwork.includes("continuous playlist channel"),"Virtual channels must be built only from rights-admitted open programming and labeled truthfully");
assert(tvNetwork.includes("PORTAL Open Cinema")&&tvNetwork.includes("Open Animation")&&tvNetwork.includes("Open Entertainment"),"PORTAL Network must retain its foundational generated channels");
