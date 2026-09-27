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
const signal = read("signal/index.html");
const radio = read("radio/index.html");
const capsule = read("capsule/index.html");
const release = read("release/index.html");
const orbit = read("orbit/index.html");
const constitution = read("CREATIVE_CONSTITUTION.md");
const connection = read("CONNECTION_CONTRACT.md");
const campfire = read("campfire/index.html");

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
assert(signal.includes("portal-blackbox-echo-seen") && signal.includes("RETURN SIGNAL"), "Signal must receive a Black Box echo only after Void sees it");
assert(capsule.includes("portal-capsule-echo") && capsule.includes("../world.js"), "Opened Capsule must create a temporal world consequence");
assert(radio.includes("portal-capsule-echo") && radio.includes("TEMPORAL ECHO"), "Radio 99.9 must be able to receive an opened Capsule echo");
assert(world.includes("echo-crossed") && world.includes("time-capsule-opened"), "World Engine must preserve spatial and temporal echo scars");
assert(home.includes('href="release/"') && home.includes("make something you cannot keep"), "Portal must expose RELEASE as an art experience");
assert(release.includes('id="art"') && release.includes("destination-out"), "RELEASE must create and destroy browser-canvas art");
assert(!release.includes("toDataURL") && !release.includes("toBlob"), "RELEASE must not serialize the artwork");
assert(release.includes("portal-release-made") && world.includes("art-released"), "Portal may remember release occurred without preserving the artwork");
assert(home.includes('href="orbit/"') && home.includes("play with gravity until it makes sense"), "Portal must expose ORBIT as play-to-learn");
assert(orbit.includes("G/r2") && orbit.includes("body.vx") && orbit.includes("body.vy"), "ORBIT must simulate gravity rather than present trivia");
assert(orbit.includes("continuous falling without hitting") && orbit.includes("portal-orbit-found"), "ORBIT must reveal the learned concept after experiential success");
for(const pillar of ["REALITY","ART","PLAY","WORLD","LEARNING","CONNECTION"]) assert(constitution.includes("### "+pillar), "Creative constitution missing "+pillar);
assert(constitution.includes("Curiosity is progression"), "Portal constitution must protect curiosity-led progression");
assert(connection.includes("No remote human is ever fabricated"), "Connection contract must prohibit fabricated humans");
assert(connection.includes("presence(room)") && connection.includes("drop(room, payload)") && connection.includes("session(room)"), "Connection substrate must define room-neutral primitives");
assert(home.includes('href="campfire/"'), "Portal must expose CAMPFIRE connection surface");
assert(campfire.includes("THIS ROOM REFUSES TO INVENT COMPANY") && campfire.includes(">0<"), "Dormant CAMPFIRE must truthfully show zero remote visitors");
assert(!campfire.includes("Math.random"), "CAMPFIRE must not fabricate activity");

console.log("Portal canonical integration contracts verified.");
