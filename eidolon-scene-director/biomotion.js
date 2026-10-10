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
 const markers={};
 for(const side of ['L','R']){
  const color=side==='L'?0x4affdc:0xff62c5;
  const group=new THREE.Group();
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(.105,16,12),new THREE.MeshBasicMaterial({color,depthTest:false,transparent:true,opacity:.96}));
  sphere.renderOrder=100;group.add(sphere);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.18,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,depthTest:false,transparent:true,opacity:.9}));
  ring.rotation.x=-Math.PI/2;ring.renderOrder=99;group.add(ring);
  const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,1,0)]),new THREE.LineBasicMaterial({color,depthTest:false}));
  stem.renderOrder=98;group.add(stem);
  group.visible=false;scene.add(group);markers[side]={group,sphere,ring,stem};
 }
 return {update(telemetry,enabled){
  for(const side of ['L','R']){
   const p=telemetry[side],m=markers[side];m.group.visible=!!(enabled&&p);if(!p)continue;
   m.group.position.set(p.x,p.y,p.z);
   m.ring.position.y=-p.height+.015;
   const positions=m.stem.geometry.attributes.position;
   positions.setXYZ(0,0,0,0);positions.setXYZ(1,0,-p.height,0);positions.needsUpdate=true;
   m.sphere.material.color.setHex(p.height<-.04?0xff4d4d:p.height<.09?0xffe16b:side==='L'?0x4affdc:0xff62c5);
  }
 },dispose(){for(const m of Object.values(markers)){scene.remove(m.group);m.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}}};
}
export function createContactTracker(){
 let previous=null,peakPenetration=0,peakHeight=0,peakSlip=0,samples=0;
 return {update(telemetry,dt){samples++;for(const side of ['L','R']){const p=telemetry[side],old=previous?.[side];if(!p)continue;peakPenetration=Math.max(peakPenetration,Math.max(0,-p.height));peakHeight=Math.max(peakHeight,p.height);if(old&&dt>0&&Math.abs(p.height)<.09&&Math.abs(old.height)<.09){const speed=Math.hypot(p.x-old.x,p.z-old.z)/dt;peakSlip=Math.max(peakSlip,speed)}}previous=JSON.parse(JSON.stringify(telemetry))},report(){return {samples,peak_floor_penetration_m:+peakPenetration.toFixed(3),peak_foot_height_m:+peakHeight.toFixed(3),peak_near_floor_speed_mps:+peakSlip.toFixed(3),note:'Bone-origin proxy only. Not mesh sole contact, IK residual, or Stage166 audit.'}},reset(){previous=null;peakPenetration=0;peakHeight=0;peakSlip=0;samples=0}};
}
