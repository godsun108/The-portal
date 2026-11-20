const SCHEMA='ascension.friend-run.v1';
const MAX_SAMPLES=12000;
export function validateFriendRun(value){
 if(!value||value.schema!==SCHEMA||value.game!=='ASCENSION'||!Number.isFinite(value.height)||value.height<0||value.height>10000000||!Number.isFinite(value.duration)||value.duration<0||value.duration>86400||!Number.isSafeInteger(value.relics)||value.relics<0||!Array.isArray(value.samples)||value.samples.length<2||value.samples.length>MAX_SAMPLES)throw new Error('This is not a valid ASCENSION friend run.');
 let previous=-1;
 for(const sample of value.samples){
  if(!Array.isArray(sample)||sample.length!==3||!sample.every(Number.isFinite)||sample[0]<=previous||sample[0]<0||sample[0]>value.duration+.5||sample[1]<0||sample[1]>value.height+100||sample[2]<0||sample[2]>1)throw new Error('The run contains invalid replay samples.');
  previous=sample[0];
 }
 return {schema:SCHEMA,game:'ASCENSION',version:1,height:Math.floor(value.height),relics:value.relics,duration:value.duration,samples:value.samples};
}
export function createFriendRun(game){
 return validateFriendRun({schema:SCHEMA,game:'ASCENSION',height:game.height,relics:game.count,duration:game.elapsed,samples:game.recording});
}
export function downloadFriendRun(run){
 const blob=new Blob([JSON.stringify(run)],{type:'application/vnd.ascension.friend-run+json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='ascension-friend-challenge.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function readFriendRun(file){
 if(!file||file.size>2_000_000)throw new Error('Choose an ASCENSION run file under 2 MB.');
 return validateFriendRun(JSON.parse(await file.text()));
}
