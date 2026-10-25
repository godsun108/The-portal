/** Pure TruFusion proposal gate for exchange research. No money, tokens or signing. */
export function assessTruFusionProposal({proposal,ledgerHead,verifiedProposal=false,independentAuthorization=false}={}){
 const reasons=[];
 if(!proposal||proposal.schema!=='earthchain.trufusion.proposal.v0')reasons.push('unsupported_proposal');
 if(typeof ledgerHead!=='string'&&ledgerHead!==null)reasons.push('missing_ledger_head');
 if(proposal?.ledgerHead!==ledgerHead)reasons.push('stale_or_wrong_ledger_head');
 if(verifiedProposal!==true)reasons.push('proposal_digest_not_independently_verified');
 if(independentAuthorization!==true)reasons.push('signed_authorization_missing');
 return Object.freeze({reasons,eligibleForOfflinePolicyEvaluation:reasons.length===0,canTransferNativeEC:false,canAcceptUSD:false,canAssertFinality:false});
}
