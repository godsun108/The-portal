// Pure EarthPlay historical record award planner. No blockchain, persistence or API.
import {validateResult} from './ranking-engine.mjs';
export function createRecordHistory(){
 const leaders=new Map(),awards=[],seenSessions=new Set();
 return {
  accept(raw,{authenticatedPlayerId,replayVerified,serverSequence}={}){
   const r=validateResult(raw);
   if(authenticatedPlayerId!==r.playerId||replayVerified!==true)throw Error('unverified_submission');
   if(!Number.isSafeInteger(serverSequence)||serverSequence<1)throw Error('invalid_server_sequence');
   if(seenSessions.has(r.sessionId))throw Error('duplicate_session');
   const key=JSON.stringify([r.gameId,r.season]);
   const previous=leaders.get(key);
   if(previous&&serverSequence<=previous.serverSequence)throw Error('out_of_order_event');
   seenSessions.add(r.sessionId);
   // A record must strictly exceed the prior high; ties do not create awards.
   if(previous&&r.score<=previous.score)return {newRecord:false,leader:previous,award:null};
   const leader=Object.freeze({...r,serverSequence});
   const award=Object.freeze({
    schema:'earthplay.world-record-event.v1',
    eventId:r.gameId+':'+r.season+':'+String(serverSequence),
    gameId:r.gameId,season:r.season,playerId:r.playerId,
    sessionId:r.sessionId,score:r.score,achievedAt:r.endedAt,
    serverSequence,previousScore:previous?.score??null,
    status:'PROPOSED_TEST_AWARD_NOT_MINTED'
   });
   leaders.set(key,leader);awards.push(award);
   return {newRecord:true,leader,award};
  },
  current(gameId,season){return leaders.get(JSON.stringify([gameId,season]))??null},
  history(gameId,season){return awards.filter(a=>a.gameId===gameId&&a.season===season)}
 };
}
