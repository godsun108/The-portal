// Original, offline procedural Starfall soundtrack and effects. No audio files or network requests.
export function createSoundEngine({AudioContextCtor=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let context=null,master=null,bed=null,enabled=true,lastShot=-1,lastVolley=-1;
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
  const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=420;filter.Q.value=.7;
  const musicGain=context.createGain();musicGain.gain.value=.018;filter.connect(musicGain);musicGain.connect(master);
  const voices=[];
  // A slow, sustained minor-key pad: bass root, fifth, octave and a soft upper color tone.
  for(const [frequency,wave,level] of [[55,'sine',.9],[82.41,'triangle',.42],[110,'sine',.24],[164.81,'triangle',.12]]){
   const osc=context.createOscillator(),gain=context.createGain();osc.type=wave;osc.frequency.value=frequency;gain.gain.value=level;
   osc.connect(gain);gain.connect(filter);osc.start();voices.push(osc);
  }
  const lfo=context.createOscillator(),lfoGain=context.createGain();lfo.type='sine';lfo.frequency.value=.075;lfoGain.gain.value=115;
  lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();voices.push(lfo);
  bed={voices,musicGain};
 }
 async function unlock(){
  if(!enabled||!AudioContextCtor)return false;
  try{if(!context){context=new AudioContextCtor();master=context.createGain();master.gain.value=.55;master.connect(context.destination);}
   if(context.state==='suspended')await context.resume();startBed();return true;
  }catch{return false;}
 }
 function setEnabled(value){enabled=!!value;if(master)master.gain.setTargetAtTime(enabled?.55:0,now(),.025);if(enabled&&context)startBed();return enabled;}
 function shot(weapon=0){
  const t=now();if(t-lastShot<.085)return;lastShot=t;
  if(weapon===1){tone(520,{endFrequency:330,duration:.09,wave:'sawtooth',volume:.012});tone(690,{endFrequency:430,duration:.075,wave:'square',volume:.008,delay:.018});}
  else if(weapon===2){tone(880,{endFrequency:620,duration:.07,wave:'triangle',volume:.011});tone(1040,{endFrequency:760,duration:.07,wave:'square',volume:.009,delay:.035});}
  else tone(740,{endFrequency:510,duration:.055,wave:'square',volume:.009});
 }
 return Object.freeze({
  unlock,setEnabled,get enabled(){return enabled;},
  launch(){[392,523.25,659.25].forEach((f,i)=>tone(f,{duration:.22,volume:.025,delay:i*.085}));},
  shot,
  sector(index){const root=[261.63,293.66,329.63][Math.max(0,Math.min(2,index-1))];[root,root*1.25,root*1.5].forEach((f,i)=>tone(f,{duration:.24,volume:.022,delay:i*.09}));},
  guardianPhase(phase){const f=phase===3?73.42:phase===2?92.5:110;tone(f,{endFrequency:f*.58,duration:.42,wave:'sawtooth',volume:.045});tone(f*2,{endFrequency:f*1.5,duration:.3,wave:'triangle',volume:.025,delay:.06});},
  guardianVolley(){const t=now();if(t-lastVolley<.85)return;lastVolley=t;tone(460,{endFrequency:310,duration:.12,wave:'square',volume:.018});tone(690,{endFrequency:510,duration:.16,wave:'triangle',volume:.012,delay:.08});},
  hit(){tone(190,{endFrequency:75,duration:.13,wave:'triangle',volume:.045});},
  collect(){tone(660,{duration:.09,volume:.035});tone(990,{duration:.13,volume:.028,delay:.075});},
  damage(){tone(145,{endFrequency:48,duration:.28,wave:'sawtooth',volume:.055});},
  bossHit(){tone(110,{endFrequency:68,duration:.16,wave:'triangle',volume:.04});},
  victory(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,{duration:.32,volume:.035,delay:i*.11}));},
  defeat(){[220,196,146.83].forEach((f,i)=>tone(f,{duration:.35,volume:.04,delay:i*.18}));},
  dispose(){try{bed?.voices.forEach(voice=>voice.stop());context?.close();}catch{}context=null;master=null;bed=null;}
 });
}
