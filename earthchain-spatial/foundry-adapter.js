// Conceptual Reality Foundry scene adapter. Geometry here is illustrative only.
import {normalizeScene} from "./scene-contract.js";
export function fromFoundryComponents(components = []) {
  if (!Array.isArray(components)) throw new TypeError("components must be an array");
  return normalizeScene({id:"reality-foundry",objects:components.map((part,i)=>({
    id:part.id, label:part.name || part.label || part.id,
    position:Array.isArray(part.position)?part.position:[0,0,0],
    rotation:Array.isArray(part.rotation)?part.rotation:[0,0,0],
    scale:part.scale || 1, visible:part.visible!==false,
    interactive:true,kind:"model"
  }))});
}
