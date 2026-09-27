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
const campfireApi = read("connection/CAMPFIRE_API.md");
const campfireConfig = read("connection/config.json");
const campfireServer = read("connection/service/server.mjs");
const convergence = read("convergence/index.html");
const arcade = read("arcade/index.html");
const cabinets = JSON.parse(read("arcade/cabinets.json"));
const maze = read("maze/index.html");
const echoRunRoom = read("echo-run/index.html");
const machine = read("machine/index.html");
const worldEvents = read("world-events.js");
const split = read("split/index.html");
const creature = read("creature.js");
const dream = read("dream/index.html");
const reality = read("reality.js");
const stations = JSON.parse(read("stations.json"));
const stationRoom = read("stations/index.html");
const colorRoom = read("color/index.html");

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
assert(signal.includes("portal-item-signal-shard") && signal.includes("YOU BROUGHT IT BACK.") && signal.includes("portal-signal-shard-resonance"), "SIGNAL must recognize the earned shard returning from the Arcade");
assert(world.includes("signal-returned") && world.includes("signal-shard-resonance"), "World Engine must remember shard resonance without consuming the shard");
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
assert(campfire.includes("THIS ROOM REFUSES TO INVENT COMPANY") && campfire.includes('count.textContent="—"'), "Unavailable CAMPFIRE must not masquerade as a verified zero");
assert(campfire.includes("verified!==true") && campfire.includes("portal.presence.v0"), "CAMPFIRE must require verified canonical presence responses");
assert(campfire.includes("../connection/config.json") && campfire.includes("lease_seconds:45"), "CAMPFIRE must consume the canonical connection configuration and lease contract");
assert(campfireApi.includes("excludes the caller") && campfireApi.includes("No fabricated seed users"), "CAMPFIRE API must preserve real-human counting semantics");
assert(JSON.parse(campfireConfig).endpoint===null, "Connection endpoint must remain dormant until a real service is deployed");
assert(campfireServer.includes("MAX_LEASE=60") && campfireServer.includes("leases.size-1"), "Reference service must enforce bounded leases and exclude the caller");
assert(world.includes("facts.released&&facts.orbitFound&&facts.machine&&facts.blackboxSignal"), "CONVERGENCE must emerge from independent cross-room histories");
assert(home.includes('id="convergenceDoor"') && home.includes("hidden"), "CONVERGENCE must not begin as an ordinary visible door");
assert(script.includes('portal-convergence') && script.includes('#convergenceDoor'), "Homepage must reveal CONVERGENCE from earned world state");
assert(convergence.includes('THIS ROOM HAS NOT HAPPENED TO YOU') && convergence.includes('portal-convergence-seen'), "CONVERGENCE must reject direct unearned entry and remember genuine arrival");

assert(cabinets.schema==="portal.arcade.v2", "Arcade must have one canonical cabinet registry with unlock rules");
assert(cabinets.cabinets.some(g=>g.id==="orbit"&&g.status==="playable"), "ORBIT must plug into the canonical Arcade");
assert(cabinets.cabinets.some(g=>g.id==="turbo-turtle"&&g.status==="awaiting-recovery"), "Turbo Turtle must remain recovery-only until original source is found");
assert(cabinets.cabinets.some(g=>g.id==="campfire-coop"&&g.status==="dormant"), "Networked games must remain dormant before verified connection exists");
assert(cabinets.cabinets.some(g=>g.id==="maze"&&g.status==="playable"&&g.href==="../maze/"), "MAZE must be a powered canonical Arcade cabinet");
assert(maze.includes("portal-passport-id") && maze.includes("Math.floor(Date.now()/86400000)"), "MAZE must derive its daily world from browser identity and day");
assert(maze.includes("portal-release-made") && maze.includes("portal-orbit-found") && maze.includes("portal-blackbox-signal"), "MAZE whispers must derive from genuine prior Portal history");
assert(maze.includes('localStorage.setItem("portal-maze-escaped","1")') && world.includes("maze-escaped"), "MAZE escape must become persistent Portal world history");
assert(arcade.includes('fetch("cabinets.json"') && arcade.includes("SOURCE MISSING // RECOVERY REQUIRED"), "Arcade UI must consume registry and tell the truth about unavailable cabinets");
assert(arcade.includes("const powered=g=>") && arcade.includes("NO POWER // SOMETHING ELSE MUST HAPPEN FIRST"), "Arcade must derive cabinet power from canonical unlock rules");
const echoRun=cabinets.cabinets.find(g=>g.id==="echo-run");assert(echoRun&&echoRun.status==="playable"&&echoRun.unlock.all.includes("portal-blackbox-signal")&&echoRun.unlock.all.includes("portal-maze-escaped"), "ECHO RUN must be playable only when genuine cross-room history powers it");
assert(echoRunRoom.includes('portal-blackbox-signal')&&echoRunRoom.includes('portal-maze-escaped')&&echoRunRoom.includes("NO<br>POWER."), "ECHO RUN itself must reject direct unearned entry");
assert(echoRunRoom.includes('portal-echo-run-complete')&&echoRunRoom.includes('portal-item-signal-shard'), "ECHO RUN completion must mint only a local world artifact, not a financial token");
assert(world.includes('inventory.push("signal-shard")')&&world.includes('echo-carried'), "World Engine must carry the earned signal shard and remember its scar");
assert(machine.includes('portal-item-signal-shard')&&machine.includes('portal-machine-shard-exposure'), "MACHINE must react to the carried shard without consuming it");
assert(machine.includes("q===2||q===4")&&machine.includes('shard?"#d7c4ff":"#b7dfc8"'), "Signal Shard must alter MACHINE ecology rather than merely unlock content");
assert(!machine.includes('removeItem("portal-item-signal-shard")'), "MACHINE must not consume the Signal Shard");
assert(world.includes("machine-mutated")&&world.includes("machine-shard"), "World Engine must remember that carried history changed MACHINE physics");
assert(worldEvents.includes('id:"resonance"')&&worldEvents.includes("6*HOUR"), "RESONANCE must be a bounded canonical world event");
assert(worldEvents.includes('portal-signal-shard-resonance')&&worldEvents.includes('portal-machine-shard-exposure'), "RESONANCE must derive only from genuine cross-room history");
assert(worldEvents.includes("prior.ends")&&worldEvents.includes("state.history"), "World events must preserve real start/end history across reloads");
assert(home.includes("world-events.js")&&signal.includes("world-events.js")&&machine.includes("world-events.js")&&maze.includes("world-events.js"), "Participating rooms must consume the one canonical World Event Engine");
assert(script.includes('PortalEvents?.active')&&signal.includes('PortalEvents?.active')&&machine.includes('PortalEvents?.active')&&maze.includes('PortalEvents?.active'), "RESONANCE must be interpreted differently across rooms");
assert(home.includes('id="splitDoor"')&&home.includes("hidden"), "THE SPLIT must begin hidden rather than as an ordinary room");
assert(script.includes('e?.id==="resonance"')&&script.includes('!localStorage.getItem("portal-world-fork")'), "THE SPLIT must surface only during RESONANCE before a fork exists");
assert(split.includes('PortalEvents?.active?.id==="resonance"')&&split.includes('location.replace("../")'), "Direct unearned SPLIT entry must be rejected");
assert(split.includes('localStorage.setItem("portal-world-fork",fork)')&&split.includes('if(localStorage.getItem("portal-world-fork"))return'), "World fork must be one-time and browser-persistent");
assert(!split.includes('removeItem("portal-world-fork")'), "THE SPLIT must not provide a reset path");
assert(world.includes('fork:localStorage.getItem("portal-world-fork")')&&world.includes('"fork-"+facts.fork'), "World Engine must preserve the chosen branch as a scar");
assert(script.includes('dataset.worldFork=fork')&&script.includes('fork==="left"')&&script.includes('fork==="right"'), "Existing Portal surfaces must interpret forked histories differently");
assert(creature.includes('portal-machine')&&creature.includes('portal-machine-shard-exposure')&&creature.includes('portal-world-fork')&&creature.includes('portal-signal-shard-resonance')&&creature.includes('portal-convergence'), "Creature emergence must derive only from truthful Portal history");
assert(creature.includes("score>=5?3:score>=4?2:score>=3?1:0"), "Creature must emerge in evidence stages rather than gamified XP");
assert(!creature.match(/\b(hunger|health|xp|feed)\b/i), "Creature model must not become a pet meter");
assert(home.includes("creature.js")&&machine.includes("creature.js")&&maze.includes("creature.js")&&signal.includes("creature.js"), "Creature evidence must consume one canonical emergence model");
assert(machine.includes('PortalCreature.seen("machine")')&&maze.includes('PortalCreature.seen("maze")')&&signal.includes('PortalCreature.seen("signal")'), "Independent rooms must reveal bounded creature sightings");
assert(script.includes('PortalCreature')&&script.includes("SOMETHING MOVED BETWEEN TWO DOORS."), "Homepage may rarely reveal creature evidence without advertising it");
assert(voidRoom.includes("../creature.js")&&voidRoom.includes("THERE IS LESS NOTHING HERE")&&voidRoom.includes('>OPEN<')&&voidRoom.includes('>CLOSE<'), "VOID must present the creature-linked choice without moral labels");
assert(voidRoom.includes('portal-creature-void-choice')&&!voidRoom.includes("save creature")&&!voidRoom.includes("harm creature"), "VOID choice must persist without explaining creature consequence");
assert(creature.includes('choice==="open"')&&creature.includes('fork==="left"')&&creature.includes('fork==="right"'), "Creature ecology must interpret the same VOID action differently across world forks");
assert(world.includes('voidChoice:localStorage.getItem("portal-creature-void-choice")')&&world.includes('"void-"+facts.voidChoice'), "World Engine must remember the unlabeled ecological consequence");
assert(creature.includes('portal-creature-last-seen')&&creature.includes("absence>=21600000")&&creature.includes("now-choiceAt>=21600000"), "Creature change after absence must require six real elapsed hours since both choice and last presence");
assert(creature.includes('outcome:relation==="sheltered"?"growth"')&&creature.includes('relation==="released"?"migration"')&&creature.includes('relation==="hidden"?"trace"')&&creature.includes('relation==="contained"?"stillness"'), "Forked ecology must produce distinct return consequences");
assert(machine.includes("PortalCreature?.afterAbsence")&&machine.includes("when you left")&&machine.includes("while you were gone"), "MACHINE must reveal ecological evidence after genuine absence");
assert(script.includes("portal-creature-return-noticed")&&script.includes("SOMETHING GREW WHILE YOU WERE GONE."), "Homepage must acknowledge a return consequence only once");
assert(!creature.includes("setInterval("), "Creature absence must be derived from wall-clock time, not fake background simulation");
assert(script.includes('portal-arcade")==="1"')&&!script.includes('portal-arcade-unlocked'), "Homepage must use canonical Arcade discovery state");
assert(campfire.includes('count.textContent="—"')&&campfire.includes('sessionStorage.getItem("portal-campfire-visitor")'), "CAMPFIRE must distinguish unavailable from verified zero and keep a session-stable visitor");
assert(campfire.includes('localStorage.setItem("portal-campfire-verified","1")'), "CAMPFIRE network unlock must follow a verified canonical presence response");
assert(passport.includes('"THE SPLIT"')&&passport.includes('"ECOLOGY"')&&passport.includes('"FONZI"')&&passport.includes('"CONVERGENCE"'), "Passport must cover current deep-world milestones");
assert(passport.includes("portal-world-events-v1")&&passport.includes("portal-creature-v1"), "Passport must surface canonical event history and unexplained creature evidence");
assert(world.includes("const divergence=facts.fork")&&world.includes("mazeSalt")&&world.includes("machineSurvival")&&world.includes("dreamTone"), "World Engine must own one canonical fork-divergence interpretation");
assert(maze.includes("PortalWorld?.divergence?.mazeSalt")&&maze.includes("passport+forkSalt"), "Forked worlds must generate physically different MAZE geometry");
assert(machine.includes("PortalWorld?.divergence?.machineSurvival")&&machine.includes("forkSurvival===3")&&machine.includes("forkSurvival===4"), "Forked worlds must alter MACHINE base survival physics");
assert(dream.includes("PortalWorld?.divergence")&&dream.includes("room you remember choosing not to enter")&&dream.includes("a door used to be"), "DREAM must interpret fork divergence differently by branch");
assert(!dream.includes("portal-arcade-unlocked"), "DREAM must not revive deprecated Arcade state");
assert(reality.includes("https://godsun108.github.io/earth-now/dynamic/latest.json")&&reality.includes('earth-now.atlas.v1')&&reality.includes('semantic==="observed"'), "Reality Bridge must consume only canonical observed Earth Now state");
assert(reality.includes("Number(strong.mag)>=5")&&reality.includes("<=6*HOUR")&&!reality.includes("earthquake.usgs.gov/earthquakes/feed"), "Portal reality phenomena must be fresh and must not duplicate Earth ingestion");
assert(home.includes("reality.js")&&dream.includes("../reality.js"), "Portal surfaces must consume one canonical Reality Bridge");
assert(creature.includes('destination=rooms[s.afterAbsence.outcome]')&&creature.includes('evidence:(room)'), "Creature ecology must own absence migration topology");
assert(maze.includes('evidence?.("maze")')&&signal.includes('evidence?.("signal")'), "Creature migration evidence must cross existing rooms");
assert(dream.includes("historyDream")&&dream.includes("W?.scars")&&dream.includes("This part is real."), "DREAM must remix genuine history and distinguish real Earth observations");
assert(script.includes("portal-fonzi-crossed-fork")&&script.includes("FONZI REFERENCED A BRANCH THIS WORLD DID NOT TAKE."), "Fonzi may uniquely remember the road not taken");
assert(campfire.includes("d.others>0")&&campfire.includes("portal-campfire-overlap")&&world.includes("shared-fire"), "Human world phenomena must require verified remote overlap");
assert(JSON.parse(campfireConfig).endpoint===null, "Human phenomena must remain dormant while canonical connection endpoint is unavailable");
assert(home.includes("the fire refuses imaginary company")&&!home.includes("there will be other people here"), "Dormant CAMPFIRE must not promise remote humans");
assert(campfireServer.includes('RATE_MAX=12')&&campfireServer.includes('"/healthz"')&&campfireServer.includes("rate limited"), "CAMPFIRE reference service must expose health and bound presence writes before deployment");
assert(read("style.css").includes("FINAL MOBILE INTEGRITY")&&read("style.css").includes("env(safe-area-inset-bottom)")&&read("style.css").includes("touch-action:manipulation"), "Portal homepage must preserve phone safe areas and touch semantics");
assert(stations.schema==="portal.stations.v1"&&stations.stations.some(s=>s.id==="reality")&&stations.stations.some(s=>s.id==="art")&&stations.stations.some(s=>s.id==="play")&&stations.stations.some(s=>s.id==="world")&&stations.stations.some(s=>s.id==="connection"), "Stations must organize the six-pillar world without duplicating rooms");
const aiStation=stations.stations.find(s=>s.id==="intelligence");assert(aiStation&&aiStation.status==="live"&&aiStation.rooms.some(r=>r[1]==="intelligence/"), "AI station must route through the truthful local Intelligence Interchange");\nconst intelligenceRoom = read("intelligence/index.html");const intelligenceConfig=JSON.parse(read("intelligence/config.json"));const intelligenceApi=read("intelligence/API.md");assert(intelligenceRoom.includes("NATIVE PORTAL SURFACE")&&intelligenceRoom.includes("NO VERIFIED INTELLIGENCE RESPONSE RETURNED"), "Intelligence must be native and refuse fabricated replies");assert(intelligenceConfig.schema==="portal.intelligence.v1"&&intelligenceConfig.endpoint===null&&intelligenceConfig.mode==="dormant"&&intelligenceConfig.minds.length>=5, "Native Intelligence must remain truthfully dormant until an inference engine is configured");assert(intelligenceApi.includes("No secret provider API keys")&&intelligenceApi.includes("portal.chat.v1"), "Intelligence contract must keep secrets server-side and remain provider-neutral");
assert(stationRoom.includes('overflow:hidden')&&stationRoom.includes("pointerdown")&&stationRoom.includes("ArrowRight")&&stationRoom.includes('fetch("../stations.json")'), "Station transit must be non-scrolling, touchable, keyboard accessible, and registry-driven");
assert(home.includes('href="stations/"')&&home.includes("ENTER THE STATIONS"), "Homepage must make Station transit primary");
assert(colorRoom.includes("TOUCH THE LIGHT")&&colorRoom.includes("createRadialGradient")&&colorRoom.includes("globalCompositeOperation=\"screen\""), "COLOR must be an interactive additive-light artwork");
assert(colorRoom.includes('localStorage.setItem("portal-color","1")')&&world.includes("touched-light"), "COLOR must leave a truthful local world scar");
console.log("Portal canonical integration contracts verified.");

{
const intelligenceConfig=JSON.parse(read("intelligence/config.json"));
const intelligenceRoom=read("intelligence/index.html");
const intelligenceApi=read("intelligence/API.md");
assert(intelligenceConfig.discovery?.protocol==="portal.discovery.v1"&&intelligenceConfig.discovery.max_per_response<=3, "Intelligence discovery must remain bounded");
assert(Array.isArray(intelligenceConfig.discovery.allowed_destinations)&&!intelligenceConfig.discovery.allowed_destinations.some(x=>/^https?:/.test(x)), "Mind discoveries must stay inside the Portal");
assert(intelligenceRoom.includes("acceptDiscoveries")&&intelligenceRoom.includes("portal-intelligence-discoveries"), "Native Intelligence must surface verified discoveries");
assert(intelligenceApi.includes("arbitrary URLs, scripts, provider links, and invented rooms are rejected"), "Discovery contract must reject invented exits");
}

// Portal Games cross-world contracts
const gameManifest=require("./games/manifest.json");
assert(gameManifest.schema==="portal.games.v1","Portal Games manifest schema");
assert(gameManifest.games.some(g=>g.id==="rift"),"RIFT remains registered");
assert(gameManifest.games.some(g=>g.id==="echo-maze"),"ECHO MAZE remains registered");
const gameState=fs.readFileSync("./games/state.js","utf8");
assert(gameState.includes("portal-game-artifacts"),"game artifacts persist across rooms");
const echo=fs.readFileSync("./games/echo-maze/index.html","utf8");
assert(echo.includes('hasArtifact("rift-key")'),"ECHO MAZE reacts to RIFT KEY");

// Earned secret station contracts
const stationMap=JSON.parse(fs.readFileSync("./stations.json","utf8"));
assert(!stationMap.stations.some(s=>s.id==="secret"),"SECRET station is not statically exposed");
const secretLogic=fs.readFileSync("./games/secret.js","utf8");
assert(secretLogic.includes('hasArtifact("deep-signal")'),"SECRET requires DEEP SIGNAL");
const stationUI=fs.readFileSync("./stations/index.html","utf8");
assert(stationUI.includes("secretRoutes()"),"transit materializes earned secrets");
const undertone=fs.readFileSync("./undertone/index.html","utf8");
assert(undertone.includes('hasArtifact("deep-signal")'),"UNDERTONE verifies access itself");
assert(undertone.includes("undertone-frequency"),"UNDERTONE grants persistent frequency artifact");

// Bounded Game Master contracts
const gm=fs.readFileSync("./intelligence/game-master.js","utf8");
assert(gm.includes("portal.gm-proposal.v1"),"GM proposals require explicit schema");
assert(gm.includes("allowedRoutes"),"GM routes are allowlisted");
assert(gm.includes("allowedEvents"),"GM events are allowlisted");
assert(gm.includes("accepted-intelligence-proposal"),"GM events require accepted proposal path");

// Arcade mastery circuit
const mastery=fs.readFileSync("./arcade/mastery.js","utf8");
for(const id of ["gravity-pearl","null-compass","swarm-heart","phase-chord","void-feather"])assert(mastery.includes(id),"mastery requires "+id);
assert(mastery.includes("have.length===MASTERY.length"),"mastery derives completion from all five artifacts");

// Arcade circuit truth
const circuit=fs.readFileSync("./arcade/circuit.js","utf8");
assert(circuit.includes("portal.arcade.circuit.v1"),"arcade circuit schema explicit");
assert(circuit.includes("portal-game-history"),"arcade circuit derives played state from run history");
assert(circuit.includes("portal-game-artifacts"),"arcade circuit derives mastery from artifacts");

// Impossible wire discovery
const wire=fs.readFileSync("./arcade/wire.js","utf8");
assert(wire.includes("portal.arcade.wire.v1"),"wire schema explicit");
assert(wire.includes("masteryLit.length>=3||c.singularity"),"wire derives eligibility from earned circuit state");
assert(wire.includes("portal-wire-discovery"),"wire discovery persists locally");
const wall=fs.readFileSync("./arcade/behind-wall.html","utf8");
assert(wall.includes("Knowing the address is not the same as finding the wire."),"direct URL does not bypass discovery");
assert(wall.includes("impossible-coordinate"),"legitimate wall discovery grants impossible coordinate");

// Impossible-coordinate consequence chain
const impossibleVoid=fs.readFileSync("./void/impossible.js","utf8");
assert(impossibleVoid.includes("portal.impossible-void.v1"),"impossible VOID schema explicit");
assert(impossibleVoid.includes('hasArtifact("impossible-coordinate")'),"VOID requires impossible coordinate");
assert(impossibleVoid.includes('grantArtifact("negative-address")'),"VOID can derive negative address");
const negativeWindow=fs.readFileSync("./window/negative.js","utf8");
assert(negativeWindow.includes('hasArtifact("negative-address")'),"WINDOW requires negative address");
assert(negativeWindow.includes("LOCAL PORTAL LAYER"),"WINDOW contradiction labels itself local");
assert(negativeWindow.includes('grantArtifact("outside-looking-in")'),"WINDOW can derive outside-looking-in");

// DEEP//RUN singularity gate
const deepRun=fs.readFileSync("./games/deep-run/index.html","utf8");
assert(deepRun.includes('hasArtifact("arcade-singularity")'),"DEEP RUN independently requires Arcade Singularity");
assert(deepRun.includes("THE ARCADE HAS NOT FOLDED YET."),"DEEP RUN direct URL remains sealed");
assert(deepRun.includes('grantArtifact("black-token")'),"DEEP RUN clear grants black token");
const arcadeRegistry=JSON.parse(fs.readFileSync("./arcade/cabinets.json","utf8"));
const deepCab=arcadeRegistry.cabinets.find(x=>x.id==="deep-run");
assert(deepCab&&deepCab.artifactUnlock.all.includes("arcade-singularity"),"Arcade only powers sublevel after Singularity");

// HOUSE//EDGE roguelike
const house=fs.readFileSync("./games/house-edge/index.html","utf8");
assert(house.includes('beginRun("house-edge")'),"HOUSE EDGE uses shared run protocol");
assert(house.includes('grantArtifact("house-mark")'),"HOUSE EDGE clear grants house mark");
assert(house.includes('scar("house-took-its-cut")'),"HOUSE EDGE failure leaves canonical scar");
assert(house.includes("CHOOSE ONE CARD FOR THIS RUN"),"HOUSE EDGE drafts cards during a run");

// PARALLAX spatial puzzle
const parallax=fs.readFileSync("./games/parallax/index.html","utf8");
assert(parallax.includes('beginRun("parallax")'),"PARALLAX uses shared run protocol");
assert(parallax.includes("powered()"),"PARALLAX evaluates connected signal graph");
assert(parallax.includes('grantArtifact(mastery?"parallax-lens":"signal-glass")'),"PARALLAX has clear and mastery rewards");
assert(parallax.includes("total<=42"),"PARALLAX mastery derives from move efficiency");

// VECTOR//BREAK action cabinet
const vectorBreak=fs.readFileSync("./games/vector-break/index.html","utf8");
assert(vectorBreak.includes('beginRun("vector-break")'),"VECTOR BREAK uses shared run protocol");
assert(vectorBreak.includes("wave>7"),"VECTOR BREAK requires seven-wave clear");
assert(vectorBreak.includes("lives>=3&&score>=1800"),"VECTOR BREAK mastery requires clean high-score clear");
assert(vectorBreak.includes('grantArtifact(clean?"vector-core":"broken-vector")'),"VECTOR BREAK grants performance-derived artifact");
assert(vectorBreak.includes('scar("vector-burn")'),"VECTOR BREAK failure records scar");

// GRAVITY//WELL precision cabinet
const gravityWell=fs.readFileSync("./games/gravity-well/index.html","utf8");
assert(gravityWell.includes('beginRun("gravity-well")'),"GRAVITY WELL uses shared run protocol");
assert(gravityWell.includes("impulses=6"),"GRAVITY WELL limits impulses");
assert(gravityWell.includes("speed<150"),"GRAVITY WELL requires controlled landing speed");
assert(gravityWell.includes('grantArtifact(mastery?"gravity-seal":"orbit-dust")'),"GRAVITY WELL grants performance-derived artifact");
assert(gravityWell.includes('scar("lost-probe")'),"GRAVITY WELL failure records scar");

// AFTERIMAGE memory cabinet
const afterimage=fs.readFileSync("./games/afterimage/index.html","utf8");
assert(afterimage.includes('beginRun("afterimage")'),"AFTERIMAGE uses shared run protocol");
assert(afterimage.includes("falsePos"),"AFTERIMAGE penalizes false selections");
assert(afterimage.includes('ratio>=.95?"perfect-memory":"afterimage"'),"AFTERIMAGE mastery derives from recall accuracy");
assert(afterimage.includes('scar("memory-static")'),"AFTERIMAGE failure records scar");
