// Starfall procedural audio: original Web Audio synth, no external assets or network requests.
export function createSoundEngine({AudioContextCtor=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let context=null,master=null,bed=null,enabled=true,lastShot=-1;
 const now=()=>context?.currentTime??0;
 function tone(frequency,{endFrequency=frequency,duration=.12,wave='sine',volume=.035,delay=0}={}){
  if(!context||!master||!enabled)return;
  const start=now()+delay,osc=context.createOscillator(),gain=context.createGain();
  osc.type=wave;osc.frequency.setValueAtTime(frequency,start);
  if(endFrequency!==frequency)osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),start+duration);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+duration+.025);
 }
 function startBed(){
  if(!context||bed||!enabled)return;
  const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=260;
  const gain=context.createGain();gain.gain.value=.012;filter.connect(gain);gain.connect(master);
  const a=context.createOscillator(),b=context.createOscillator();a.type='sine';b.type='triangle';
  a.frequency.value=55;b.frequency.value=82.41;a.connect(filter);b.connect(filter);a.start();b.start();bed={a,b,gain};
 }
 async function unlock(){
  if(!enabled)return false;
  if(!AudioContextCtor)return false;
  try{
   if(!context){context=new AudioContextCtor();master=context.createGain();master.gain.value=.55;master.connect(context.destination);}
   if(context.state==='suspended')await context.resume();
   startBed();return true;
  }catch{return false;}
 }
 function setEnabled(value){enabled=!!value;if(master)master.gain.setTargetAtTime(enabled ? 0.55 : 0,now(),.025);if(enabled&&context)startBed();return enabled;}
 return Object.freeze({
  unlock,setEnabled,get enabled(){return enabled;},
  shot(){const t=now();if(t-lastShot<.11)return;lastShot=t;tone(740,{endFrequency:510,duration:.055,wave:'square',volume:.006});},
  hit(){tone(190,{endFrequency:75,duration:.13,wave:'triangle',volume:.045});},
  collect(){tone(660,{duration:.09,volume:.035});tone(990,{duration:.13,volume:.028,delay:.075});},
  damage(){tone(145,{endFrequency:48,duration:.28,wave:'sawtooth',volume:.055});},
  bossHit(){tone(110,{endFrequency:68,duration:.16,wave:'triangle',volume:.04});},
  victory(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,{duration:.32,volume:.035,delay:i*.11}));},
  defeat(){[220,196,146.83].forEach((f,i)=>tone(f,{duration:.35,volume:.04,delay:i*.18}));},
  dispose(){try{bed?.a.stop();bed?.b.stop();context?.close();}catch{}context=null;master=null;bed=null;}
 });
}
