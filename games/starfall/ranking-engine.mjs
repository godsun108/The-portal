// EarthPlay deterministic ranking core — pure, no storage, auth or network.
export function validateResult(r){
 if(!r||typeof r!=='object'||Array.isArray(r))throw Error('invalid result');
 if(!/^[a-z0-9-]{2,40}$/.test(r.gameId||''))throw Error('invalid game');
 if(!/^[a-zA-Z0-9_-]{8,80}$/.test(r.playerId||''))throw Error('invalid player');
 if(!/^[a-z0-9-]{1,32}$/.test(r.season||''))throw Error('invalid season');
 if(!/^[a-zA-Z0-9_-]{12,128}$/.test(r.sessionId||''))throw Error('invalid session');
 if(!Number.isSafeInteger(r.score)||r.score<0||r.score>100000000)throw Error('invalid score');
 if(!Number.isSafeInteger(r.endedAt)||r.endedAt<0)throw Error('invalid timestamp');
 return Object.freeze({gameId:r.gameId,playerId:r.playerId,season:r.season,sessionId:r.sessionId,score:r.score,endedAt:r.endedAt});
}
// Trusted service must authenticate account and verify replay BEFORE calling accept.
export function createRankingStore(){
 const seen=new Set(),best=new Map();
 return {
  accept(raw,{authenticatedPlayerId,replayVerified}={}){
   const r=validateResult(raw);
   if(authenticatedPlayerId!==r.playerId||replayVerified!==true)throw Error('unverified submission');
   if(seen.has(r.sessionId))throw Error('duplicate session');
   seen.add(r.sessionId);
   const key=JSON.stringify([r.gameId,r.season,r.playerId]);
   const prior=best.get(key);
   if(!prior||r.score>prior.score||(r.score===prior.score&&r.endedAt<prior.endedAt))best.set(key,r);
   return {accepted:true,newBest:best.get(key)===r};
  },
  standings(gameId,season,{limit=50}={}){
   if(!/^[a-z0-9-]{2,40}$/.test(gameId)||!/^[a-z0-9-]{1,32}$/.test(season))throw Error('invalid filter');
   if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('invalid limit');
   return [...best.values()].filter(r=>r.gameId===gameId&&r.season===season)
    .sort((a,b)=>b.score-a.score||a.endedAt-b.endedAt||a.playerId.localeCompare(b.playerId))
    .slice(0,limit).map((r,i)=>({rank:i+1,playerId:r.playerId,score:r.score,endedAt:r.endedAt}));
  }
 };
}
