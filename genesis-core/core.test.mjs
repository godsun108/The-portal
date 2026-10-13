import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createCore} from "./core.mjs";
test("Genesis Core SQLite fixture persists data and isolates synthetic users",()=>{
 const dir=mkdtempSync(join(tmpdir(),"genesis-core-"));const path=join(dir,"core.sqlite");
 try{
  let core=createCore(path);
  assert.equal(core.create("fixture-alice",{id:"private-1",visibility:"private",body:"ALICE_SECRET"}).status,201);
  assert.equal(core.create("fixture-alice",{id:"public-1",visibility:"public",body:"Public example"}).status,201);
  assert.equal(core.read("fixture-bob","private-1").status,403);
  assert.equal(JSON.stringify(core.read("fixture-bob","private-1")).includes("ALICE_SECRET"),false);
  assert.equal(core.read("fixture-bob","public-1").status,200);
  assert.equal(core.read("fixture-alice","private-1").body,"ALICE_SECRET");
  assert.equal(core.read("wrong-token","private-1").status,401);
  assert.equal(core.create("fixture-bob",{id:"private-1",visibility:"private",body:"overwrite"}).status,409);
  core.close();
  core=createCore(path);
  assert.equal(core.read("fixture-alice","private-1").body,"ALICE_SECRET");
  assert.equal(core.read("fixture-bob","private-1").status,403);
  core.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test("Genesis Core rejects malformed records",()=>{
 const core=createCore();
 try{
  assert.equal(core.create("fixture-alice",{id:"../bad",visibility:"private",body:"x"}).status,400);
  assert.equal(core.create("fixture-alice",{id:"valid",visibility:"invalid",body:"x"}).status,400);
  assert.equal(core.create("fixture-alice",{id:"valid",visibility:"private",body:"x".repeat(4097)}).status,400);
 }finally{core.close();}
});
