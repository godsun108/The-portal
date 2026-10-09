// EIDOLON BioMotion diagnostics v1: read-only geometry and contact telemetry.
// Reuses the existing Three.js skinned mesh, skeleton, and animation mixer.
// This is NOT an IK solver or Stage166 certification.
import * as THREE from 'three';
const v=new THREE.Vector3();
export function inspectActor(actor){
 let vertices=0,triangles=0,meshes=0,bones=0;
 actor.traverse(o=>{if(o.isBone)bones++;if(o.isMesh){meshes++;const g=o.geometry,p=g?.getAttribute('position');if(p){vertices+=p.count;triangles+=g.index?Math.floor(g.index.count/3):Math.floor(p.count/3)}}});
 return {meshes,vertices,triangles,bones};
}
export function footTelemetry(actor,floorY=0){
 const out={};for(const side of ['L','R']){const foot=actor.getObjectByName('foot.'+side);if(!foot){out[side]=null;continue}foot.getWorldPosition(v);out[side]={x:v.x,y:v.y,z:v.z,height:v.y-floorY}}return out;
}
export function createFootMarkers(scene){
 const markers={};for(const side of ['L','R']){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),new THREE.MeshBasicMaterial({color:side==='L'?0x5af3e1:0xff78bd,depthTest:false}));mesh.renderOrder=10;mesh.visible=false;scene.add(mesh);markers[side]=mesh}return {update(telemetry,enabled){for(const side of ['L','R']){const point=telemetry[side],marker=markers[side];marker.visible=!!(enabled&&point);if(point)marker.position.set(point.x,point.y,point.z)}},dispose(){for(const marker of Object.values(markers)){scene.remove(marker);marker.geometry.dispose();marker.material.dispose()}}};
}
export function createContactTracker(){
 let previous=null,peakPenetration=0,peakHeight=0,peakSlip=0,samples=0;
 return {update(telemetry,dt){samples++;for(const side of ['L','R']){const p=telemetry[side],old=previous?.[side];if(!p)continue;peakPenetration=Math.max(peakPenetration,Math.max(0,-p.height));peakHeight=Math.max(peakHeight,p.height);if(old&&dt>0&&Math.abs(p.height)<.09&&Math.abs(old.height)<.09){const speed=Math.hypot(p.x-old.x,p.z-old.z)/dt;peakSlip=Math.max(peakSlip,speed)}}previous=JSON.parse(JSON.stringify(telemetry))},report(){return {samples,peak_floor_penetration_m:+peakPenetration.toFixed(3),peak_foot_height_m:+peakHeight.toFixed(3),peak_near_floor_speed_mps:+peakSlip.toFixed(3),note:'Bone-origin proxy only. Not mesh sole contact, IK residual, or Stage166 audit.'}},reset(){previous=null;peakPenetration=0;peakHeight=0;peakSlip=0;samples=0}};
}
