// Runtime mirror of Sovereign-Core genesis/voice/browser-speech-output.mjs.
// Device playback only: no neural weights, network requests, or audio-file output.
const nonEmpty=value=>typeof value==="string"&&value.trim().length>0;
export function createBrowserSpeechOutputAdapter({speak,cancel,voices=[],locales=["en-US"]}={}) {
 if(typeof speak!=="function"||typeof cancel!=="function")throw new TypeError("browser_speech_host_functions_required");
 if(!Array.isArray(locales)||!locales.length||locales.some(x=>!nonEmpty(x)))throw new TypeError("browser_speech_locales_required");
 if(!Array.isArray(voices)||voices.some(v=>!v||!nonEmpty(v.voice_id)||!nonEmpty(v.name)||!nonEmpty(v.locale)))throw new TypeError("browser_speech_voice_inventory_invalid");
 const supportedLocales=Object.freeze([...new Set(locales.map(x=>x.toLowerCase()))]);
 const inventory=Object.freeze(voices.map(v=>Object.freeze({...v})));
 return Object.freeze({
  manifest:Object.freeze({adapter_id:"browser-native-speech-output",adapter_version:"1.0.0",kind:"device_speech_playback_sink",execution:"on_device",locales:supportedLocales,voice_inventory:inventory,produces_audio_file:false}),
  async play({text,locale="en-US",voice_id,rate=1,pitch=1}={}) {
   if(!nonEmpty(text))throw new TypeError("speech_text_required");
   if(!nonEmpty(locale)||!supportedLocales.includes(locale.toLowerCase()))throw new Error("browser_speech_locale_unsupported");
   if(!Number.isFinite(rate)||rate<0.5||rate>2||!Number.isFinite(pitch)||pitch<0||pitch>2)throw new RangeError("browser_speech_controls_out_of_range");
   if(voice_id&&!inventory.some(v=>v.voice_id===voice_id&&v.locale.toLowerCase()===locale.toLowerCase()))throw new Error("browser_speech_voice_not_in_host_inventory");
   await speak(Object.freeze({text,locale,voice_id:voice_id||null,rate,pitch}));
   return Object.freeze({ok:true,played:true,adapter_id:"browser-native-speech-output",execution:"on_device",audio_file_created:false});
  },
  stop(){cancel();}
 });
}
