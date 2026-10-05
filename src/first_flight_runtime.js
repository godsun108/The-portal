// FIRST FLIGHT integration runtime: campaign + continuous universe + reality bridge.
export const FIRST_FLIGHT={
 id:"first-flight",version:1,
 beats:[
  {id:"wake",zone:"apartment",mode:"story"},
  {id:"street",zone:"street",mode:"walk"},
  {id:"drive",zone:"city",mode:"vehicle"},
  {id:"spaceport",zone:"spaceport",mode:"story",fieldMission:{optional:true,proof:"public_region",fallback:"signal_scan"}},
  {id:"board",zone:"spacecraft",mode:"story"},
  {id:"liftoff",zone:"atmosphere",mode:"flight"},
  {id:"first_orbit",zone:"orbit",mode:"flight"}
 ]
};
export function nextBeat(completed=[]){
 const done=new Set(completed);return FIRST_FLIGHT.beats.find(b=>!done.has(b.id))||null;
}
export function progress(completed=[]){
 const unique=new Set(completed.filter(x=>FIRST_FLIGHT.beats.some(b=>b.id===x)));
 return {completed:unique.size,total:FIRST_FLIGHT.beats.length,ratio:unique.size/FIRST_FLIGHT.beats.length,next:nextBeat([...unique])};
}
