export async function xrCapabilities(nav=globalThis.navigator){const xr=nav?.xr;if(!xr)return{webxr:false,vr:false,ar:false};const support=async mode=>{try{return await xr.isSessionSupported(mode)}catch{return false}};const [vr,ar]=await Promise.all([support("immersive-vr"),support("immersive-ar")]);return{webxr:true,vr,ar}}
export function comfortSettings(input={}){return{locomotion:input.locomotion==="smooth"?"smooth":"teleport",turn:input.turn==="smooth"?"smooth":"snap",snapDegrees:Math.max(15,Math.min(90,Number(input.snapDegrees)||30)),vignette:input.vignette!==false,seated:Boolean(input.seated)}}
export function xrInputState(){return{head:null,left:null,right:null,hands:{left:null,right:null},select:{left:false,right:false}}}
export function poseToPoint(pose){const p=pose?.transform?.position;return p?{x:p.x,y:p.y,z:p.z}:null}
export function spatialAnchor({id,x=0,y=0,z=0}={}){return{id:id||"anchor",position:{x,y,z},persistent:false}}

export function interactionTarget(objects=[],point,maxDistance=.25){let best=null,d=maxDistance;for(const o of objects){const p=o.position||o,dx=p.x-point.x,dy=p.y-point.y,dz=(p.z||0)-(point.z||0),n=Math.hypot(dx,dy,dz);if(n<=d){d=n;best=o}}return best}
export function grabState(){let held=null;return{get held(){return held},grab(object){if(held||!object)return false;held=object;return true},release(){const out=held;held=null;return out}}}
export async function requestXRSession(mode="immersive-vr",options={optionalFeatures:["local-floor","bounded-floor"]},nav=globalThis.navigator){if(!nav?.xr?.requestSession)throw Error("WebXR unavailable");return nav.xr.requestSession(mode,options)}
