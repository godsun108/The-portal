/** Offline block evidence: binds a transaction set to a validator-signed commitment.
 * Verifies test signatures and Merkle inclusion only; not distributed consensus/finality.
 */
import {buildTestMerkle,verifyTestInclusion} from './ec-offline-merkle.mjs';
import {blockCommitment,verifyOfflineQuorum} from './ec-offline-quorum.mjs';
export async function assembleOfflineBlock({networkId,height,parentHash,transactionIds}){
 const {root}=await buildTestMerkle(transactionIds);
 const block=Object.freeze({networkId,height,parentHash,transactionRoot:root});
 return Object.freeze({block,commitment:await blockCommitment(block),transactionIds:Object.freeze([...transactionIds])});
}
export async function verifyOfflineBlockEvidence({block,certificate,validators,threshold,proof}){
 const quorum=await verifyOfflineQuorum(block,certificate,validators,{threshold});
 if(!await verifyTestInclusion(proof,block.transactionRoot))throw Error('Transaction inclusion proof invalid');
 return Object.freeze({kind:'OFFLINE_BLOCK_EVIDENCE_NOT_FINALITY',quorum,transactionId:proof.transactionId,canSettleNativeEC:false,canAcceptUSD:false});
}
