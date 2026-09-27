const fs = require("fs");
const assert = require("assert");

const read = p => fs.readFileSync(p, "utf8");
const earth = read("earth/index.html");
const windowRoom = read("window/index.html");
const pulse = read("pulse/index.html");
const home = read("index.html");
const script = read("script.js");

assert(earth.includes("https://godsun108.github.io/earth-now/"), "EARTH must embed canonical Earth Now");
assert(earth.includes("earth-now:open-eyes"), "EARTH must listen for canonical OPEN EYES handoff");
assert(earth.includes("../window/?"), "EARTH must route EYES through Portal WINDOW");

assert(windowRoom.includes("https://godsun108.github.io/window-earth/"), "WINDOW must embed canonical WINDOW");
assert(windowRoom.includes("location.search"), "WINDOW must preserve handoff query parameters");
assert(!windowRoom.includes("youtube-nocookie.com/embed/"), "Portal WINDOW must not fabricate camera embeds");

assert(pulse.includes("https://godsun108.github.io/earth-now/dynamic/latest.json"), "EARTH PULSE must consume canonical Earth Now snapshot");
assert(!pulse.includes("earthquake.usgs.gov/earthquakes/feed"), "EARTH PULSE must not duplicate direct USGS ingestion");

assert(home.includes('id="fonzi"'), "Fonzi must remain a hidden homepage incursion, not a normal room");
assert(script.includes('portal-fonzi-found'), "Fonzi first contact must persist locally");
assert(script.includes('SOMETHING THAT WAS NOT A DOOR'), "Fonzi must enter through the world layer rather than door taxonomy");
assert(!home.includes('<strong>FONZI</strong>'), "Fonzi must not be advertised as a Portal door");

console.log("Portal canonical integration contracts verified.");
