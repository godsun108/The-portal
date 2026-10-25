/** Detect validator equivocation in independently signed offline block certificates.
 * This is evidence analysis, NOT a slashing mechanism or fork-choice consensus.
 */
import {blockCommitment,verifyOfflineQuorum} from './ec-offline-quorum.mjs';
export async function detectValidatorEquivocation(left,right,validators,{threshold}={}){
 const a=await verifyOfflineQuorum(left.block,left.certificate,validators,{threshold});
 const b=await verifyOfflineQuorum(right.block,right.certificate,validators,{threshold});
 if(left.block.networkId!==right.block.networkId||left.block.height!==right.block.height)return Object.freeze({sameSlot:false,equivocators:[],conflict:false});
 const conflict=a.commitment!==b.commitment;
 const l=new Set(left.certificate.signatures.map(s=>s.id));
 const equivocators=conflict?right.certificate.signatures.filter(s=>l.has(s.id)).map(s=>s.id).sort():[];
 return Object.freeze({sameSlot:true,conflict,equivocators,commitments:conflict?[await blockCommitment(left.block),await blockCommitment(right.block)]:[] ,kind:'OFFLINE_DOUBLE_SIGN_EVIDENCE_NOT_SLASHING'});
}
export function chooseOfflineChain(left,right){
 if(left?.schema!=='earthchain.offline.chain.v0'||right?.schema!=='earthchain.offline.chain.v0'||left.networkId!==right.networkId||left.genesisHash!==right.genesisHash)throw Error('Incomparable offline chains');
 const n=Math.min(left.blocks.length,right.blocks.length);
 for(let i=0;i<n;i++)if(left.blocks[i].commitment!==right.blocks[i].commitment)return Object.freeze({decision:'HALT_CONFLICT_REQUIRES_EXTERNAL_RESOLUTION',height:i+1,selected:null});
 return Object.freeze({decision:left.blocks.length===right.blocks.length?'IDENTICAL_OR_SHARED_PREFIX':'LONGER_VERIFIED_EXTENSION',selected:left.blocks.length>=right.blocks.length?'left':'right',height:n});
}
