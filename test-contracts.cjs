const fs = require("fs");
const assert = require("assert");

const read = p => fs.readFileSync(p, "utf8");
const earth = read("earth/index.html");
const windowRoom = read("window/index.html");
const pulse = read("pulse/index.html");
const home = read("index.html");
const script = read("script.js");
const oracle = read("oracle/index.html");
const passport = read("passport/index.html");
const blackbox = read("blackbox/index.html");
const voidRoom = read("void/index.html");
const world = read("world.js");

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
assert(script.includes('fonzi-travel-v0'), "Portal Fonzi must identify itself as a travel-form prototype");

assert(oracle.includes("You are the Oracle"), "Portal Oracle must make the user-as-forecaster mechanic legible");
assert(oracle.includes("COMMIT") && oracle.includes("RESOLVE") && oracle.includes("CALIBRATE"), "Portal Oracle must expose its calibration loop");
assert(oracle.includes("(pr-(y?1:0))**2"), "Portal Oracle must preserve Brier scoring");
assert(home.includes("THE DEEPER NETWORK"), "Portal homepage must distinguish threshold experiences from deeper rooms");
assert(passport.includes("../world.js") && passport.includes("WORLD PRESSURE") && passport.includes("THINGS THE WORLD REMEMBERS"), "Passport must surface persistent Portal world state");
assert(blackbox.includes("portal-blackbox-echo"), "Black Box must leave a persistent consequence");
assert(voidRoom.includes("portal-blackbox-echo") && voidRoom.includes("FOREIGN HASH"), "Void must be able to receive the Black Box consequence");
assert(world.includes("blackbox-fed"), "World Engine must remember that the Black Box was fed");

console.log("Portal canonical integration contracts verified.");
