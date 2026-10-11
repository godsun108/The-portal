// EarthPlay optional sprite atlas loader. Fail closed to existing procedural Canvas art.
// Never accept external URLs or derive entitlement from an image asset.
import {frameAt} from './animation-engine.mjs';
const allowed=new Set(['fire-horse','solar-lion']);
const atlases=new Map();
export function validateAtlas(a){
 return !!a&&a.version===1&&allowed.has(a.id)&&typeof a.image==='string'&&/^\.\/assets\/[a-z0-9-]+\.(?:png|svg)$/.test(a.image)&&Number.isInteger(a.frameWidth)&&a.frameWidth>=16&&a.frameWidth<=256&&Number.isInteger(a.frameHeight)&&a.frameHeight>=16&&a.frameHeight<=256&&Number.isInteger(a.frames)&&a.frames>=1&&a.frames<=16&&Number.isFinite(a.fps)&&a.fps>0&&a.fps<=30;
}
export async function preloadAtlas(id){
 if(!allowed.has(id))return false;
 if(atlases.has(id))return atlases.get(id).ready;
 const entry={ready:false,image:null,manifest:null};atlases.set(id,entry);
 try{
  const response=await fetch('./assets/'+id+'.json',{cache:'force-cache'});
  if(!response.ok)return false;
  const manifest=await response.json();if(!validateAtlas(manifest)||manifest.id!==id)return false;
  const image=new Image();image.decoding='async';image.src=manifest.image;
  await image.decode();
  if(image.naturalWidth!==manifest.frameWidth*manifest.frames||image.naturalHeight!==manifest.frameHeight)return false;
  entry.image=image;entry.manifest=manifest;entry.ready=true;return true;
 }catch{return false;}
}
export function paintAtlas(ctx,id,time){
 const a=atlases.get(id);if(!a?.ready)return false;
 const {image,manifest:m}=a;const frame=frameAt(time,m.fps,m.frames);
 ctx.drawImage(image,frame*m.frameWidth,0,m.frameWidth,m.frameHeight,-m.frameWidth/2,-m.frameHeight/2,m.frameWidth,m.frameHeight);
 return true;
}
