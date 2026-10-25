/** Portable private seller draft exports, intentionally excluding credentials and photos. */
import {encodeSellerDraft,decodeSellerDraft,sellerReviewPacket} from './earthchain-seller-storage.mjs';
export function exportSellerBackup(draft){
 const record=JSON.parse(encodeSellerDraft(draft));
 return JSON.stringify({format:'earthchain-seller-backup',exportVersion:1,record},null,2);
}
export function importSellerBackup(raw){
 if(typeof raw!=='string'||raw.length>8192)throw Error('Invalid backup');
 const value=JSON.parse(raw);
 if(!value||value.format!=='earthchain-seller-backup'||value.exportVersion!==1||!value.record||typeof value.record!=='object')throw Error('Unsupported backup');
 return decodeSellerDraft(JSON.stringify(value.record));
}
export function sellerApprovalChecklist(draft){
 const packet=sellerReviewPacket(draft);
 return Object.freeze({listingId:packet.listingId,requirements:packet.reviewIssues,photoPermissionGranted:false,identityApproved:false,paymentApproved:false,shippingAndReturnsApproved:false,submitted:false,approved:false,canPublish:false});
}
