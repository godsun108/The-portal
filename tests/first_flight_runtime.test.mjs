import assert from "node:assert/strict";import{FIRST_FLIGHT,progress}from "../src/first_flight_runtime.js";
assert.equal(progress([]).next.id,"wake");assert.equal(progress(FIRST_FLIGHT.beats.map(x=>x.id)).ratio,1);console.log("first-flight runtime ok");
