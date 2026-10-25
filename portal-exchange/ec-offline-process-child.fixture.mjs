/** Child process fixture for offline cooperative locking tests. */
import {createOfflineDurableStore} from './ec-offline-durable-store.node.mjs';
import {createOfflineProcessLockedSigner} from './ec-offline-process-locked-signer.node.mjs';
const [storePath,lockPath,commitment,delayMs='0']=process.argv.slice(2);
const signer=createOfflineProcessLockedSigner({
 networkId:'earthchain-test',validatorId:'v0',
 store:createOfflineDurableStore(storePath),lockPath,
 sign:async()=>{if(Number(delayMs))await new Promise(r=>setTimeout(r,Number(delayMs)));return 'fixture-signature'}
});
try{await signer.signVote({height:1,round:0,phase:'PREPARE',commitment});process.stdout.write('SIGNED\n')}
catch(e){process.stdout.write('BLOCKED: '+e.message+'\n');process.exitCode=2}
