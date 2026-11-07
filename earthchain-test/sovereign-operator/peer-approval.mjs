// UI consent gate. This is manual fingerprint verification, not automatic identity enrollment.
export function createPeerApproval(){let expected=null,approved=false;return Object.freeze({
 present(fingerprint){if(typeof fingerprint!=="string"||!/^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(fingerprint))throw Error("invalid_peer_fingerprint");expected=fingerprint;approved=false;return expected;},
 approve(verifiedFingerprint){if(!expected||verifiedFingerprint!==expected)throw Error("peer_fingerprint_not_verified");approved=true;return true;},
 get approved(){return approved;},
 revoke(){expected=null;approved=false;}
});}
