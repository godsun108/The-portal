// Pure adapter from trusted world-record event to EXISTING signed ECTEST collectible format.
// NOT an issuer, minting endpoint, or authority to accept client scores.
import {hash} from './commerce/browser-commerce.mjs';
export function championTokenId(event){
 if(event?.schema!=='earthplay.world-record-event.v1'||event.gameId!=='starfall')throw Error('invalid_record_event');
 if(!/^[a-z0-9-]{1,32}$/.test(event.season)||!Number.isSafeInteger(event.serverSequence)||event.serverSequence<1)throw Error('invalid_record_identity');
 return 'starfall-champion-'+event.season+'-'+event.serverSequence;
}
export async function championIssueIntent(event,{walletAddress,verifiedAward,verifiedWalletBinding}={}){
 if(verifiedAward!==true||verifiedWalletBinding!==true)throw Error('trusted_verification_required');
 if(!/^ec_[a-f0-9]{32}$/.test(walletAddress||''))throw Error('invalid_wallet_address');
 if(!Number.isSafeInteger(event.score)||event.score<0||event.status!=='PROPOSED_TEST_AWARD_NOT_MINTED')throw Error('invalid_award');
 const tokenId=championTokenId(event);
 const metadata={schema:'earthchain.game-collectible.v1',gameId:'starfall',skinId:'starfall-celestial-crown',tokenId,testOnly:true,achievement:'world-record-legacy',season:event.season,recordSequence:event.serverSequence};
 return Object.freeze({schema:'earthplay.champion-issue-intent.v1',idempotencyKey:event.eventId,recipient:walletAddress,tokenId,metadata,metadataHash:await hash(metadata),status:'PENDING_TRUSTED_ISSUER_NOT_MINTED'});
}
