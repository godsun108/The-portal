/** Genesis v0.6 offline finalization pipeline. NOT production consensus. */
import {verifyValidatorVotes} from './earthchain-signed-votes.mjs';
import {applySignedBlock} from './earthchain-signed-blocks.mjs';
import {exportJournal,importJournal} from './earthchain-recovery-lab.mjs';
import {detectEquivocation} from './earthchain-validator-node-lab.mjs';
export function finalizeOfflineBlock({chain,block,validatorKeys,votes,allocations,previousVotes=[]}){
 if(!Array.isArray(previousVotes))throw Error('Invalid prior vote history');
 const conflicts=detectEquivocation([...previousVotes,...votes]);
 if(conflicts.length)throw Error('Validator equivocation detected');
 const quorum=verifyValidatorVotes({chain,block,validatorKeys,votes});
 const next=applySignedBlock(chain,block);
 const journal=exportJournal(next,allocations);
 const recovered=importJournal(journal);
 if(recovered.tip!==next.tip||JSON.stringify(recovered.state)!==JSON.stringify(next.state))throw Error('Recovery mismatch');
 return {chain:next,quorum,journal,verifiedRecovery:true};
}
