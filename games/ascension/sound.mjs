// Original procedural ASCENSION sound effects. No external audio assets.
let context=null,enabled=false;
const tones={
  bounce:[185,0.07,'triangle'],pulse:[110,0.24,'sawtooth'],relic:[740,0.12,'sine'],
  pickup:[520,0.16,'triangle'],damage:[82,0.22,'sawtooth'],boss:[260,0.34,'square'],
  victory:[660,0.55,'triangle'],fall:[95,0.4,'sawtooth']
};
export async function setSoundEnabled(value){
  if(!value){enabled=false;return false;}
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Audio)return false;
  try{context??=new Audio();if(context.state==='suspended')await context.resume();enabled=true;return true;}
  catch{return false;}
}
export function soundEvent(name){
  if(!enabled||!context||!tones[name])return;
  const [frequency,duration,wave]=tones[name],now=context.currentTime;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,now);
  if(name==='relic'||name==='pickup'||name==='victory')oscillator.frequency.exponentialRampToValueAtTime(frequency*1.55,now+duration*.72);
  else oscillator.frequency.exponentialRampToValueAtTime(Math.max(35,frequency*.58),now+duration);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(name==='bounce'?.035:.065,now+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  oscillator.connect(gain);gain.connect(context.destination);
  oscillator.start(now);oscillator.stop(now+duration+.02);
}
