import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const temp = await mkdtemp(path.join(tmpdir(), "portal-contract-check-"));

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with ${result.status ?? result.signal}`);
}

async function testFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter(entry => entry.isFile() && entry.name.endsWith(".test.mjs"))
    .map(entry => path.join(directory, entry.name)).sort();
}

try {
  const syntaxFiles = [
    "test-contracts.cjs",
    "test-experience.cjs",
    "tv-open-curator.cjs",
    "tv-network.js",
    "tv-programming-director.js",
    "scripts/check-music-preview-player.cjs",
    "earthchain-test/sovereign-operator/operator.mjs",
    "earthchain-test/sovereign-operator/sight.mjs",
    "earthchain-test/sovereign-operator/assessment.mjs",
    "earthchain-test/sovereign-operator/local-bridge.mjs",
    "earthchain-test/sovereign-operator/peer-approval.mjs",
    "earthchain-test/sovereign-operator/sovereign-execution-bridge.mjs",
    "earthchain-test/sovereign-operator/pairing-code.mjs",
    "earthchain-test/sovereign-operator/invite-link.mjs",
    "earthchain-test/sovereign-operator/signed-bridge-offer.mjs",
    "earthchain-test/sovereign-operator/signed-bridge-answer.mjs",
    "earthchain-test/sovereign-operator/qrcode.js"
  ];
  for (const file of syntaxFiles) run("node", ["--check", file]);

  run("node", ["test-contracts.cjs"]);
  run("node", ["scripts/check-music-preview-player.cjs"]);
  run("node", ["test-experience.cjs"]);

  run("npm", ["install", "--prefix", "genesis-core", "--no-package-lock", "--ignore-scripts"]);
  const genesisTests = [
    ...await testFiles("earthchain-genesis"),
    ...await testFiles("genesis-core")
  ];
  if (!genesisTests.length) throw new Error("No Genesis/EarthID test files were found.");
  run("node", ["--test", ...genesisTests]);

  const arrival = await readFile("earthchain-test/sovereign-operator/arrival-portable.html", "utf8");
  const scripts = [...arrival.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 1) throw new Error("Expected exactly one inline script in portable Arrival.");
  const arrivalScript = path.join(temp, "arrival-portable.js");
  await writeFile(arrivalScript, scripts[0][1], "utf8");
  run("node", ["--check", arrivalScript]);

  const operatorTests = await testFiles("earthchain-test/sovereign-operator");
  if (!operatorTests.length) throw new Error("No Genesis operator test files were found.");
  run("node", ["--test", ...operatorTests]);

  process.stdout.write("Portal internal contract suite passed.\n");
} finally {
  await rm(temp, { recursive: true, force: true });
}
