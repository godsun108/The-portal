import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecordHistory} from './record-history.mjs';
const entry=(playerId,sessionId,score,endedAt=100)=>({gameId:'starfall',season:'pilot-1',playerId,sessionId,score,endedAt});
function accept(store,r,sequence){return store.accept(r,{authenticatedPlayerId:r.playerId,replayVerified:true,serverSequence:sequence})}
test('record passes from first champion to next while preserving award history',()=>{
 const s=createRecordHistory();
 const a=accept(s,entry('player_0001','session_0000001',511),1);
 const b=accept(s,entry('player_0002','session_0000002',750),2);
 assert.equal(a.newRecord,true);assert.equal(b.newRecord,true);
 assert.equal(s.current('starfall','pilot-1').playerId,'player_0002');
 assert.deepEqual(s.history('starfall','pilot-1').map(x=>x.score),[511,750]);
 assert.equal(s.history('starfall','pilot-1')[0].status,'PROPOSED_TEST_AWARD_NOT_MINTED');
});
test('ties and lower scores never generate award',()=>{
 const s=createRecordHistory();accept(s,entry('player_0001','session_0000001',511),1);
 assert.equal(accept(s,entry('player_0002','session_0000002',511),2).newRecord,false);
 assert.equal(accept(s,entry('player_0003','session_0000003',100),3).newRecord,false);
 assert.equal(s.history('starfall','pilot-1').length,1);
});
test('rejects unauthenticated, unverified, duplicate and stale sequence',()=>{
 const s=createRecordHistory(),a=entry('player_0001','session_0000001',511);
 assert.throws(()=>s.accept(a,{authenticatedPlayerId:'player_0002',replayVerified:true,serverSequence:1}));
 assert.throws(()=>s.accept(a,{authenticatedPlayerId:a.playerId,replayVerified:false,serverSequence:1}));
 accept(s,a,1);
 assert.throws(()=>accept(s,a,2));
 assert.throws(()=>accept(s,entry('player_0002','session_0000002',900),1));
});
test('seasons are independent',()=>{
 const s=createRecordHistory();accept(s,entry('player_0001','session_0000001',511),1);
 const r={...entry('player_0002','session_0000002',30),season:'pilot-2'};
 assert.equal(accept(s,r,1).newRecord,true);
 assert.equal(s.history('starfall','pilot-2').length,1);
});
