// Decode a bounded subset of reachable HLS streams with ffprobe.
// This is technical evidence only, not browser/device playback or redistribution authorization.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
const report=JSON.parse(readFileSync('world-tv-stream-health.json','utf8'));
if(report.schema!=='portal.tv.world-stream-health.v1')throw Error('Unexpected stream report');
const selected=report.results.filter(x=>x.status==='http_reachable'&&/^https:\/\//.test(x.url)).slice(0,12);
async function verify(x){return await new Promise(resolve=>{const args=['-v','error','-show_entries','stream=codec_type,codec_name','-of','json','-rw_timeout','6000000','-i',x.url];const child=spawn('ffprobe',args,{stdio:['ignore','pipe','pipe']});let output='',error='',done=false;const finish=(status,detail)=>{if(done)return;done=true;clearTimeout(timer);resolve({name:x.name,url:x.url,status,detail,rightsStatus:'unverified',devicePlaybackVerified:false})};const timer=setTimeout(()=>{child.kill('SIGKILL');finish('timeout','Probe exceeded 10 seconds')},10000);child.stdout.on('data',b=>{if(output.length<16000)output+=b});child.stderr.on('data',b=>{if(error.length<500)error+=b});child.on('error',e=>finish('probe_error',String(e.message).slice(0,180)));child.on('close',code=>{try{const streams=JSON.parse(output).streams||[];finish(code===0&&streams.some(s=>s.codec_type==='video')?'video_decodable':'not_verified',streams.map(s=>s.codec_name).join(',')||error.slice(0,160))}catch{finish('not_verified',error.slice(0,160))}})})}
const results=[];for(let i=0;i<selected.length;i+=3)results.push(...await Promise.all(selected.slice(i,i+3).map(verify)));
writeFileSync('world-tv-decode-evidence.json',JSON.stringify({schema:'portal.tv.decode-evidence.v1',generatedAt:new Date().toISOString(),results,disclaimer:'ffprobe codec detection only. No browser playback or rights clearance.'},null,2)+'\n');
console.log('Video decodable:',results.filter(x=>x.status==='video_decodable').length,'of',results.length);
