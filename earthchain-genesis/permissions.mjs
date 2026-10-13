/* Pure, deny-by-default authorization policy contract.
 * This is NOT authentication or an enforcement point: server-side authorization
 * must independently validate trusted identity, resource ownership and grants.
 */
export const ACTIONS=Object.freeze(["content:read","content:create","content:edit","content:delete","member:manage","chat:read","chat:send","stream:start","billing:manage"]);
export const VISIBILITIES=Object.freeze(["public","followers","members","private"]);
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const validId=value=>typeof value==="string"&&value.length>0&&value.length<=256&&!/\\s/.test(value);
export function authorize({actor,resource,action,grants=[]}={}){
 if(!ACTIONS.includes(action))return {allowed:false,reason:"unknown-action"};
 if(!actor||!validId(actor.id)||actor.authenticated!==true)return {allowed:false,reason:"authentication-required"};
 if(!resource||!validId(resource.id)||!validId(resource.ownerId)||!VISIBILITIES.includes(resource.visibility))return {allowed:false,reason:"invalid-resource"};
 const owner=actor.id===resource.ownerId;
 if(owner)return {allowed:true,reason:"owner"};
 if(action==="content:read"&&resource.visibility==="public")return {allowed:true,reason:"public"};
 if(!Array.isArray(grants))return {allowed:false,reason:"invalid-grants"};
 const matching=grants.some(grant=>grant&&typeof grant==="object"&&own(grant,"actorId")&&grant.actorId===actor.id&&grant.resourceId===resource.id&&grant.action===action&&grant.active===true);
 if(matching)return {allowed:true,reason:"explicit-grant"};
 return {allowed:false,reason:"no-permission"};
}
