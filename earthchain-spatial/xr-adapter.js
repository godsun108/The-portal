import {normalizeScene} from "./scene-contract.js";
export function toXRObjects(scene) {
  return normalizeScene(scene).objects.filter(o=>o.visible).map(o=>({
    id:o.id,position:{x:o.position[0],y:o.position[1],z:o.position[2]},
    scale:o.scale,grabbable:o.interactive,color:[.35,.75,1]
  }));
}
