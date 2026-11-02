import test from "node:test";
import assert from "node:assert/strict";
import { connectStarfallMultiplayer } from "./multiplayer-client.mjs";

class FakeSocket {
  readyState = 1;
  listeners = new Map();
  sent = [];
  addEventListener(type, fn) { const list=this.listeners.get(type)||[]; list.push(fn); this.listeners.set(type,list); }
  removeEventListener(type, fn) { this.listeners.set(type,(this.listeners.get(type)||[]).filter(x=>x!==fn)); }
  send(value) { this.sent.push(JSON.parse(value)); }
  emit(type, data) { for (const fn of this.listeners.get(type)||[]) fn({ data: JSON.stringify(data) }); }
}

const envelope = (deviceId, payload) => ({
  schema:"portal.spatial.message.v1", sessionId:"ROOM1", deviceId,
  type:"game-action", payload, at:1
});

test("client sends Starfall actions through the shared spatial envelope", () => {
  const socket=new FakeSocket();
  const client=connectStarfallMultiplayer({socket,matchId:"ROOM1",playerId:"phone-a"});
  const result=client.send("move",{x:.25,y:.5});
  assert.equal(result.ok,true);
  assert.equal(socket.sent[0].schema,"portal.spatial.message.v1");
  assert.equal(socket.sent[0].payload.sequence,1);
  assert.equal(socket.sent[0].payload.type,"move");
  client.close();
});

test("client receives valid peer actions once and ignores duplicates and invalid rooms", () => {
  const socket=new FakeSocket(), received=[];
  const client=connectStarfallMultiplayer({socket,matchId:"ROOM1",playerId:"phone-a",onAction:a=>received.push(a)});
  const action={schema:"earthchain.starfall.action.v1",matchId:"ROOM1",playerId:"phone-b",sequence:1,type:"fire",payload:{}};
  socket.emit("message",envelope("phone-b",action));
  socket.emit("message",envelope("phone-b",action));
  socket.emit("message",{...envelope("phone-b",action),sessionId:"OTHER"});
  assert.equal(received.length,1);
  client.close();
});

test("client refuses to send while disconnected and detaches listeners on close", () => {
  const socket=new FakeSocket();
  socket.readyState=0;
  const client=connectStarfallMultiplayer({socket,matchId:"ROOM1",playerId:"phone-a"});
  assert.equal(client.send("move",{}).reason,"not_connected");
  client.close();
  assert.equal(socket.listeners.get("message").length,0);
});
