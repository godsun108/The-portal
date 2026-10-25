/** Native EarthChain finality integration contract.
 * An unconfigured verifier always rejects. Never infer finality from a receipt field.
 */
export const NATIVE_FINALITY_REQUIREMENTS=Object.freeze([
 'authenticated_trusted_genesis_and_chain_id',
 'independently_verified_validator_set_and_quorum',
 'canonical_block_header_and_transaction_inclusion_proof',
 'fork_choice_and_finality_rules',
 'reorg_and_rollback_protection',
 'independent_rpc_or_light_client_proof_source'
]);
export function nativeFinalityReadiness(evidence={}){
 const missing=NATIVE_FINALITY_REQUIREMENTS.filter(k=>evidence[k]!==true);
 return Object.freeze({missing,readyForExternalAudit:missing.length===0,configured:false,canVerifyProduction:false});
}
export function makeUnconfiguredNativeFinalityVerifier(){
 return async function verifyFinality(){throw Error('Native EarthChain validator finality integration is not configured');};
}
