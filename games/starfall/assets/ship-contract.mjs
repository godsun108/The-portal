// Starfall asset foundry: pure, deterministic ship silhouette descriptors.
// Lightweight 2D geometry contract; a future GLB exporter may target this shape.
export const SHIPS=Object.freeze({
 "fire-horse":Object.freeze({name:"Fire Horse",fill:"#ff724e",accent:"#ffc078",points:[[0,-23],[10,-7],[21,15],[7,10],[0,4],[-7,10],[-21,15],[-10,-7]],engines:[[-11,13],[11,13]]}),
 "solar-lion":Object.freeze({name:"Solar Lion",fill:"#ffc65c",accent:"#fff1a5",points:[[0,-25],[10,-9],[23,3],[18,16],[0,8],[-18,16],[-23,3],[-10,-9]],engines:[[-12,14],[12,14]]})
});
export function getShip(id){return Object.hasOwn(SHIPS,id)?SHIPS[id]:null;}
export function bounds(points){if(!Array.isArray(points)||points.length<3)throw Error("invalid_polygon");return {minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))};}
export function validateShip(id){const ship=getShip(id);if(!ship)return false;return ship.points.every(p=>p.length===2&&p.every(Number.isFinite))&&ship.engines.every(p=>p.length===2&&p.every(Number.isFinite))&&bounds(ship.points).maxX-bounds(ship.points).minX<=50;}
