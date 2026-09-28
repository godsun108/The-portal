const ART="portal-game-artifacts",SCARS="portal-game-scars";
const load=k=>{try{return JSON.parse(localStorage.getItem(k)||"[]")}catch(e){return[]}},save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
export function artifactId(x){if(!x||typeof x!=="object"||x.id)return x?.id||null;const ks=Object.keys(x).filter(k=>/^\d+$/.test(k)).sort((a,b)=>+a-+b);return ks.length?ks.map(k=>x[k]).join(""):null}
function normalizeArtifact(a){return typeof a==="string"?{id:a}:a&&typeof a==="object"?a:null}
export function grantArtifact(a){const item=normalizeArtifact(a);if(!item?.id)return null;const xs=load(ART);if(!xs.some(x=>artifactId(x)===item.id))xs.push({...item,at:new Date().toISOString()});save(ART,xs);window.dispatchEvent(new CustomEvent("portal:artifact",{detail:item}));return item}
export function scar(s){const item=typeof s==="string"?{id:s}:s;if(!item)return null;const xs=load(SCARS);xs.push({...item,at:new Date().toISOString()});save(SCARS,xs.slice(-50));return item}
export function hasArtifact(id){return load(ART).some(x=>artifactId(x)===id)}
export function artifacts(){return load(ART).map(x=>x?.id?x:{...x,id:artifactId(x)}).filter(x=>x.id)}
export function scars(){return load(SCARS)}
