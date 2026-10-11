import test from 'node:test';
import assert from 'node:assert/strict';
import {SHIPS,getShip,bounds,validateShip} from './ship-contract.mjs';

test('both original hulls have valid finite geometry',()=>{
 for(const id of ['fire-horse','solar-lion']){
  assert.equal(validateShip(id),true);
  const s=getShip(id);
  assert.ok(s.points.length>=8);
  assert.equal(s.engines.length,2);
  const b=bounds(s.points);
  assert.ok(b.minX<0&&b.maxX>0&&b.minY<0&&b.maxY>0);
 }
});
test('unknown IDs cannot inherit an owned hull silhouette',()=>{
 assert.equal(getShip('unknown'),null);
 assert.equal(getShip('__proto__'),null);
 assert.equal(validateShip('unknown'),false);
});
test('hull silhouettes are distinct',()=>{
 assert.notDeepEqual(SHIPS['fire-horse'].points,SHIPS['solar-lion'].points);
 assert.notEqual(SHIPS['fire-horse'].fill,SHIPS['solar-lion'].fill);
});
test('invalid polygon is rejected',()=>{
 assert.throws(()=>bounds([]),/invalid_polygon/);
});
