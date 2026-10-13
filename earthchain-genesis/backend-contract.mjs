/* Shared backend request contract. Pure validation only: not an auth provider,
 * token verifier, authorization gateway, database or production endpoint.
 */
export const RESOURCE_KINDS=Object.freeze(["post","message","membership","stream","media"]);
export const OPERATIONS=Object.freeze(["read","create","update","delete"]);
const id=value=>typeof value==="string"&&/^[a-zA-Z0-9_-]{1,128}$/.test(value);
export function validateResourceRequest(input){
 if(!input||typeof input!=="object"||Array.isArray(input))return {ok:false,error:"invalid-request"};
 const {resourceKind,resourceId,operation}=input;
 if(!RESOURCE_KINDS.includes(resourceKind))return {ok:false,error:"unsupported-resource"};
 if(!OPERATIONS.includes(operation))return {ok:false,error:"unsupported-operation"};
 if(operation!=="create"&&!id(resourceId))return {ok:false,error:"invalid-resource-id"};
 if(operation==="create"&&resourceId!==undefined)return {ok:false,error:"unexpected-resource-id"};
 return {ok:true,value:{resourceKind,operation,...(operation==="create"?{}:{resourceId})}};
}
export function sessionContextFromTrustedPrincipal(principal){
 if(!principal||typeof principal!=="object"||!id(principal.subject)||principal.verified!==true)return {ok:false,error:"unverified-principal"};
 return {ok:true,actor:{id:principal.subject,authenticated:true}};
}
