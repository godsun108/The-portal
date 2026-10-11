// Pure validation contract for a future authenticated Starfall asset intake service.
// This module makes no network calls and does not store credentials or assets.
const HULLS=new Set(['fire-horse','solar-lion']);
const FORMATS=new Set(['png','svg']);
export const MAX_IMAGE_BYTES=2_000_000;
export function validateSubmissionMetadata(meta){
 if(!meta||typeof meta!=='object'||Array.isArray(meta))return {ok:false,reason:'invalid_metadata'};
 if(!HULLS.has(meta.hull)||!FORMATS.has(meta.format))return {ok:false,reason:'unsupported_asset'};
 if(typeof meta.sha256!=='string'||!/^[a-f0-9]{64}$/.test(meta.sha256))return {ok:false,reason:'invalid_digest'};
 if(!Number.isSafeInteger(meta.byteLength)||meta.byteLength<45||meta.byteLength>MAX_IMAGE_BYTES)return {ok:false,reason:'invalid_size'};
 if(meta.manifest?.version!==1||meta.manifest?.id!==meta.hull||meta.manifest?.image!==`./assets/${meta.hull}.${meta.format}`)return {ok:false,reason:'manifest_mismatch'};
 const m=meta.manifest;
 if(!Number.isInteger(m.frameWidth)||m.frameWidth<16||m.frameWidth>256||!Number.isInteger(m.frameHeight)||m.frameHeight<16||m.frameHeight>256||!Number.isInteger(m.frames)||m.frames<1||m.frames>16||!Number.isFinite(m.fps)||m.fps<=0||m.fps>30)return {ok:false,reason:'invalid_animation'};
 return {ok:true};
}
export function stagingPaths(meta){
 const result=validateSubmissionMetadata(meta);
 if(!result.ok)throw Error(result.reason);
 return {image:`games/starfall/assets/staging/${meta.hull}.${meta.format}`,manifest:`games/starfall/assets/staging/${meta.hull}.json`};
}
