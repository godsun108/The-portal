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
assert(!arcade.includes('id="stage" hidden'),"Arcade native stage must not depend on the hidden attribute");\nassert(arcade.includes('stage.style.setProperty("display","grid","important")'),"Arcade open path explicitly reveals the stage");
assert(pulse.includes("earth-now/dynamic/latest.json"),"Pulse reads canonical Earth snapshot");
const stations=JSON.parse(read("./stations.json"));
for(const station of stations.stations)for(const room of station.rooms){const href=room[1];if(href.startsWith("#")||/^https?:/.test(href))continue;const p="./"+href.replace(/^\.\//,"").replace(/\/$/,"")+"/index.html";assert(fs.existsSync(p),"Missing station destination: "+station.id+" / "+room[0]+" -> "+p)}
for(const p of ["./index.html","./earth/index.html","./window/index.html","./arcade/index.html","./pulse/index.html"]){const s=read(p);assert(!s.includes("window-node-production"),p+" contains stale Window domain");assert(!s.includes("portal-arcade-unlocked"),p+" contains deprecated Arcade key")}
console.log("Portal experience contracts passed.");
