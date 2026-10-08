import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id);
const status=$('status');
const report=s=>{status.textContent=s;$('log').textContent+='\n'+s;};
const canvas=$('view');
try{
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.setSize(480,640,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x17243a);
 const camera=new THREE.PerspectiveCamera(39,480/640,.01,100);
 const controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.enablePan=false;
 scene.add(new THREE.HemisphereLight(0xe9f2ff,0x65627b,1.4));
 const main=new THREE.DirectionalLight(0xffe1ce,2.4);main.position.set(2,4,4);scene.add(main);
 const rim=new THREE.DirectionalLight(0xb5d5ff,1.6);rim.position.set(-3,2,-2);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xffffff,.65);fill.position.set(-3,1,4);scene.add(fill);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 let model=null,wire=false,loaded=false,mixer=null,clips=[],recording=false,recorder=null,captureStream=null,videoBlob=null,videoURL=null,videoName='',recordStopTimer=null;
 function cameraPosition(view){
  controls.target.set(0,.48,0);
  const r=1.85,a=view==='side'?Math.PI/2:view==='back'?Math.PI:view==='threequarter'?Math.PI/4:0;
  camera.position.set(Math.sin(a)*r,.53,Math.cos(a)*r);
  controls.update();camera.lookAt(controls.target);
 }
 cameraPosition('threequarter');
 const timer=new THREE.Clock();function frame(t){requestAnimationFrame(frame);const dt=Math.min(timer.getDelta(),.06);if(mixer)mixer.update(dt);controls.update();renderer.render(scene,camera)}
 requestAnimationFrame(frame);
 document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>{cameraPosition(b.dataset.angle);report('VIEW: '+b.dataset.angle)});

 let evidenceURL=null,evidenceBlob=null;
 $('turntable').onclick=()=>{
  if(!model)return report('Load an EIDOLON model first');
  const frames=[],angles=['front','threequarter','side','back'];
  if(mixer)mixer.stopAllAction();
  const prior=scene.background;
  for(const angle of angles){
   cameraPosition(angle);controls.update();renderer.render(scene,camera);
   const pixels=document.createElement('canvas');pixels.width=480;pixels.height=640;
   pixels.getContext('2d').drawImage(canvas,0,0,480,640);frames.push(pixels);
  }
  const combined=document.createElement('canvas');combined.width=960;combined.height=1280;
  const context=combined.getContext('2d');context.fillStyle='#101a2d';context.fillRect(0,0,960,1280);
  frames.forEach((frame,i)=>{let x=(i%2)*480,y=Math.floor(i/2)*640;context.drawImage(frame,x,y);context.fillStyle='white';context.font='22px system-ui';context.fillText(angles[i].toUpperCase(),x+20,y+40)});
  combined.toBlob(blob=>{
   if(!blob){$('proofstatus').textContent='Proof sheet PNG failed';return}
   evidenceBlob=blob;if(evidenceURL)URL.revokeObjectURL(evidenceURL);
   evidenceURL=URL.createObjectURL(blob);
   $('proofimage').src=evidenceURL;$('proofdownload').href=evidenceURL;
   $('proofpanel').hidden=false;
   $('proofstatus').textContent='Proof captured from '+$('asset').value+'.';
   $('proofpanel').scrollIntoView({behavior:'smooth',block:'start'});
  },'image/png');
 };
 $('proofshare').onclick=async()=>{
  if(!evidenceBlob)return;
  try{
   const file=new File([evidenceBlob],'eidolon-four-view.png',{type:'image/png'});
   if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file]});
   else report('Sharing unavailable; use the PNG download link');
  }catch(err){if(err.name!=='AbortError')report('Share failed: '+err.message)}
 };
 $('saveaudit').onclick=()=>{
  const marks=[...document.querySelectorAll('.quality')].map(e=>({gate:e.parentElement.textContent.trim(),passed:e.checked}));
  const record={model:$('asset').value,time:new Date().toISOString(),gates:marks,
   total:marks.length,passed:marks.filter(x=>x.passed).length,all_passed:marks.every(x=>x.passed),
   video_verified:false,note:'Manual visual QA only. No automated realism score. Needs motion evidence.'};
  const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'});
  const link=document.createElement('a'),url=URL.createObjectURL(blob);
  link.href=url;link.download='eidolon-hero-qa-'+$('asset').value+'.json';
  document.body.appendChild(link);link.click();link.remove();
  $('auditstatus').textContent='QA: '+record.passed+'/'+record.total+' manually checked. Motion certification pending.';
  setTimeout(()=>URL.revokeObjectURL(url),1500);
 };

 $('background').onchange=()=>{
  const color=$('background').value;scene.background=color==='white'?new THREE.Color(0xffffff):color==='transparent'?null:new THREE.Color(0x17243a);
  report('BACKGROUND: '+color);
 };
 $('wire').onclick=()=>{if(!model)return report('Load the canonical model first');wire=!wire;model.traverse(n=>{if(n.isMesh){n.material.wireframe=wire}});report('Wireframe '+(wire?'on':'off'))};
 $('save').onclick=()=>{
  if(!loaded)return report('Load the actor first');
  renderer.render(scene,camera);
  canvas.toBlob(blob=>{
   if(!blob)return report('PNG generation failed');
   const u=URL.createObjectURL(blob);
   if(window.previousPNG)URL.revokeObjectURL(window.previousPNG);window.previousPNG=u;
   $('preview').src=u;$('previewpanel').hidden=false;
   $('pngdownload').href=u;$('pngdownload').download='eidolon-canonical-human-v1.png';
   $('previewpanel').scrollIntoView({behavior:'smooth',block:'start'});
   report('PASS: PNG captured · '+blob.size+' bytes · long-press preview to save');
  },'image/png');
 };
 $('share').onclick=async()=>{
  try{
   if(!window.previousPNG)return;
   const blob=await(await fetch(window.previousPNG)).blob();
   const file=new File([blob],'eidolon-canonical-human-v1.png',{type:'image/png'});
   if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file]});
   else report('Share unavailable; long-press PNG preview instead');
  }catch(e){if(e.name!=='AbortError')report('SHARE: '+e.message)}
 };
 function play(name){
  if(!mixer)return report('No embedded animation loaded');
  const clip=clips.find(c=>c.name.endsWith(name));
  if(!clip)return report('Animation '+name+' absent');
  mixer.stopAllAction();mixer.clipAction(clip).reset().play();report('PLAYING '+clip.name);
 }
 $('clipIdle').onclick=()=>play('Idle');
 $('clipWalk').onclick=()=>play('Walk');
 $('clipStop').onclick=()=>{if(mixer){mixer.stopAllAction();report('Motion stopped')}};

 function recordingMime(){
  if(typeof MediaRecorder==='undefined')return '';
  const types=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm;codecs=vp9','video/webm'];
  return types.find(type=>MediaRecorder.isTypeSupported(type))||'';
 }
 function finishRecording(){
  if(!recording)return;
  recording=false;
  if(recordStopTimer){clearTimeout(recordStopTimer);recordStopTimer=null}
  $('recordwalk').disabled=!mixer;
  $('stoprecord').disabled=true;
  try{if(recorder&&recorder.state!=='inactive')recorder.stop()}catch(err){report('VIDEO STOP FAILED: '+err.message)}
  $('recordstatus').textContent='Finalizing recording…';
 }
 $('stoprecord').onclick=finishRecording;
 $('recordwalk').onclick=()=>{
  if(recording||!mixer||!loaded)return report('Load the animated actor first');
  if(!canvas.captureStream||typeof MediaRecorder==='undefined'){
   $('recordstatus').textContent='This browser cannot record the 3D canvas. Use iPhone Screen Recording, then upload the video.';
   return report('VIDEO: canvas recording unsupported');
  }
  const mime=recordingMime();
  if(!mime){$('recordstatus').textContent='No supported video recorder format. Try Safari or iPhone Screen Recording.';return}
  try{
   const clip=clips.find(c=>c.name.endsWith('Walk'));if(!clip)throw Error('Walk clip missing');
   mixer.stopAllAction();mixer.clipAction(clip).reset().play();
   captureStream=canvas.captureStream(24);
   const chunks=[];
   recorder=new MediaRecorder(captureStream,{mimeType:mime,videoBitsPerSecond:2200000});
   recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data)};
   recorder.onerror=event=>{report('VIDEO RECORDER ERROR: '+(event.error?.message||'Unknown error'));$('recordstatus').textContent='Recording failed';finishRecording()};
   recorder.onstop=()=>{
    captureStream?.getTracks().forEach(track=>track.stop());captureStream=null;
    if(!chunks.length){$('recordstatus').textContent='No video frames were produced; try Screen Recording or another browser.';return}
    const type=mime.startsWith('video/mp4')?'video/mp4':'video/webm';
    videoBlob=new Blob(chunks,{type});
    if(videoURL)URL.revokeObjectURL(videoURL);
    videoURL=URL.createObjectURL(videoBlob);
    videoName='eidolon-'+$('asset').value+'-walk.'+(type==='video/mp4'?'mp4':'webm');
    const preview=$('videopreview');preview.src=videoURL;preview.load();
    const link=$('videodownload');link.href=videoURL;link.download=videoName;
    $('videopanel').hidden=false;
    $('recordstatus').textContent='Video ready: '+(videoBlob.size/1024/1024).toFixed(2)+' MB · '+videoName+'. Use Share / Save to Files.';
    $('videopanel').scrollIntoView({behavior:'smooth',block:'start'});
    report('VIDEO READY: '+videoName+' ('+videoBlob.size+' bytes)');
   };
   recorder.start(500);
   recording=true;$('recordwalk').disabled=true;$('stoprecord').disabled=false;
   const seconds=Number($('recordseconds').value)||5;
   $('recordstatus').textContent='Recording '+seconds+'s of walking… Keep this page open.';
   report('VIDEO RECORDING: '+seconds+' seconds · '+mime);
   recordStopTimer=setTimeout(finishRecording,seconds*1000);
  }catch(err){
   captureStream?.getTracks().forEach(t=>t.stop());captureStream=null;
   recording=false;$('recordwalk').disabled=!mixer;$('stoprecord').disabled=true;
   $('recordstatus').textContent='Recording unavailable: '+err.message;
   report('VIDEO FAILED: '+err.message);
  }
 };
 $('videoshare').onclick=async()=>{
  if(!videoBlob)return;
  try{
   const file=new File([videoBlob],videoName,{type:videoBlob.type});
   if(navigator.share&&navigator.canShare?.({files:[file]})){
    await navigator.share({files:[file],title:'EIDOLON Walking Video'});
    report('Video share sheet opened');
   }else{
    $('recordstatus').textContent='File sharing unsupported here. Try Download Walking Video, or use iPhone Screen Recording.';
   }
  }catch(err){if(err.name!=='AbortError'){$('recordstatus').textContent='Share failed: '+err.message+' · Try Download Walking Video.'}}
 };

 $('asset').onchange=()=>{$('load').disabled=false;$('load').click()};
 $('load').onclick=async()=>{
  if(recording)finishRecording();
  $('load').disabled=true;
  $('recordwalk').disabled=true;
  for(const id of ['clipIdle','clipWalk','clipStop'])$(id).disabled=true;
  try{
   const kind=$('asset').value;
   report('Fetching '+(kind==='v3'?'V3 smoothed skin rig':kind==='v2'?'V2 region-aware rig':kind==='rigged'?'V1 experimental rig':'canonical static')+' Stage164 asset…');
   const path=kind==='v11'?'eidolon-human-v1-rigged-v11-pivots.glb':kind==='v10'?'eidolon-human-v1-rigged-v10-hero.glb':kind==='v9'?'eidolon-human-v1-rigged-v9-hero.glb':kind==='v8'?'eidolon-human-v1-rigged-v8-anatomy.glb':kind==='v7'?'eidolon-human-v1-rigged-v7-anatomy.glb':kind==='v6'?'eidolon-human-v1-rigged-v6-gait.glb':kind==='v5'?'eidolon-human-v1-rigged-v5-surface.glb':kind==='v4'?'eidolon-human-v1-rigged-v4-experimental.glb':kind==='v3'?'eidolon-human-v1-rigged-v3-experimental.glb':kind==='v2'?'eidolon-human-v1-rigged-v2-experimental.glb':kind==='rigged'?'eidolon-human-v1-rigged-experimental.glb':'eidolon-human-v1-canonical.glb';
   const manifest=await fetch('../eidolon-canonical/assets/'+(kind==='v11'?'rig-v11-manifest.json':kind==='v10'?'rig-v10-manifest.json':kind==='v9'?'rig-v9-manifest.json':kind==='v8'?'rig-v8-manifest.json':kind==='v7'?'rig-v7-manifest.json':kind==='v6'?'rig-v6-manifest.json':kind==='v5'?'rig-v5-manifest.json':kind==='v4'?'rig-v4-manifest.json':kind==='v3'?'rig-v3-manifest.json':kind==='v2'?'rig-v2-manifest.json':kind==='rigged'?'rig-manifest.json':'manifest.json')+'?build=2',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Manifest HTTP '+r.status+' · asset build may still be publishing');return r.json()});
   const gltf=await new GLTFLoader().loadAsync('../eidolon-canonical/assets/'+path+'?build=2');
   const fresh=gltf.scene;
   let verts=0,tri=0,skinned=0,bones=0;
   fresh.traverse(n=>{if(n.isMesh){verts+=n.geometry.attributes.position.count;tri+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;if(n.isSkinnedMesh)skinned++}if(n.isBone)bones++});
   if((kind==='v5'||kind==='v6'||kind==='v7'||kind==='v8'||kind==='v9'||kind==='v10'||kind==='v11'||kind==='v11'||kind==='v11'||kind==='v10')?(verts!==manifest.vertices||tri!==manifest.triangles):(verts!==12240||tri!==24454))throw Error('Topology mismatch after GLB import: '+verts+' / '+tri);
   if(kind!=='static'&&(skinned<1||bones<17||gltf.animations.length<2))throw Error('Rig not complete: '+skinned+' skinned meshes / '+bones+' bones / '+gltf.animations.length+' clips');
   if(model)scene.remove(model);
   model=fresh;scene.add(model);loaded=true;wire=false;
   $('turntable').disabled=false;
   if(kind==='v7'||kind==='v8'||kind==='v9'){
    let head=null;fresh.traverse(n=>{if(n.isBone&&n.name==='head')head=n;
      if(n.isSkinnedMesh){
        n.material=new THREE.MeshStandardMaterial({color:(kind==='v8'||kind==='v9'||kind==='v10')?0xffffff:0xd3a58f,vertexColors:(kind==='v8'||kind==='v9'),roughness:.78,metalness:0,side:THREE.DoubleSide});
      }
    });
    if(head){
      const skin=new THREE.MeshStandardMaterial({color:0xc69a87,roughness:.84});
      const hairMat=new THREE.MeshStandardMaterial({color:0x292024,roughness:.9});
      const eyeWhite=new THREE.MeshStandardMaterial({color:0xf0e6dd,roughness:.31});
      const iris=new THREE.MeshStandardMaterial({color:0x4e594d,roughness:.32});
      const lip=new THREE.MeshStandardMaterial({color:0x995f5c,roughness:.81});
      function ell(name,x,y,z,rx,ry,rz,mat){
       const part=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),mat);
       part.name=name;part.scale.set(rx,ry,rz);part.position.set(x,y,z);head.add(part);
      }
      for(const side of [-1,1]){
       ell('eye_'+side,side*.027,kind==='v11'?-.012:.007,kind==='v11'?.079:.063,.013,.008,.005,eyeWhite);
       ell('iris_'+side,side*.027,kind==='v11'?-.012:.007,kind==='v11'?.086:.068,.005,.006,.003,iris);
       ell('brow_'+side,side*.028,kind==='v11'?.006:.024,kind==='v11'?.076:.062,.016,.003,.005,hairMat);
       if((kind!=='v9'&&kind!=='v10'&&kind!=='v11'))ell('ear_'+side,side*.071,-.015,0,.012,.023,.015,skin);
      }
      if(kind!=='v9')ell('nose',0,-.014,.071,.012,.02,.018,skin);
      ell('lower_lip',0,-.043,.064,.022,.004,.004,lip);
      ell('hair',0,.07,-.006,.077,.023,.062,hairMat);
    } else report('V7 head bone not found; facial geometry skipped');
   }

   clips=gltf.animations;mixer=clips.length?new THREE.AnimationMixer(model):null;
   for(const id of ['clipIdle','clipWalk','clipStop'])$(id).disabled=!mixer;
   $('recordwalk').disabled=!mixer;$('recordstatus').textContent=mixer?'Ready: choose a camera view and tap Record Walk Video.':'Select an animated model to record.';
   $('motionhint').textContent=mixer?'Animated model loaded: select Idle or Walk to test motion.':'Static mesh loaded: zero animations (expected). Switch to Animated experiment above.';
   $('stats').textContent='PASS · '+verts.toLocaleString()+' vertices · '+tri.toLocaleString()+' triangles · '+skinned+' skinned meshes · '+bones+' bones · '+clips.length+' clips';
   $('download').hidden=false;$('download').href='../eidolon-canonical/assets/'+path;
   $('download').download=path;
   report('PASS: Stage164 '+kind+' GLB imported. '+(kind!=='static'?'Experimental skinning and clips detected; visually compare deformations.':'Static canonical research geometry.'));
   if(mixer)play('Idle');
  }catch(e){$('load').disabled=false;report('LOAD FAILED: '+e.message)}
 };
 report('3D renderer ready; tap Load Canonical Human v1');
}catch(e){report('ENGINE FAILED: '+e.message)}
