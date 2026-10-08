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
 scene.add(new THREE.HemisphereLight(0xffffff,0x73849a,2.8));
 const main=new THREE.DirectionalLight(0xffffff,2);main.position.set(2,4,4);scene.add(main);
 let model=null,wire=false,loaded=false,mixer=null,clips=[];
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
 $('asset').onchange=()=>{$('load').disabled=false;$('load').click()};
 $('load').onclick=async()=>{
  $('load').disabled=true;
  for(const id of ['clipIdle','clipWalk','clipStop'])$(id).disabled=true;
  try{
   const kind=$('asset').value;
   report('Fetching '+(kind==='v2'?'V2 region-aware rig':kind==='rigged'?'V1 experimental rig':'canonical static')+' Stage164 asset…');
   const path=kind==='v2'?'eidolon-human-v1-rigged-v2-experimental.glb':kind==='rigged'?'eidolon-human-v1-rigged-experimental.glb':'eidolon-human-v1-canonical.glb';
   const manifest=await fetch('../eidolon-canonical/assets/'+(kind==='v2'?'rig-v2-manifest.json':kind==='rigged'?'rig-manifest.json':'manifest.json')+'?build=2',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Manifest HTTP '+r.status+' · asset build may still be publishing');return r.json()});
   const gltf=await new GLTFLoader().loadAsync('../eidolon-canonical/assets/'+path+'?build=2');
   const fresh=gltf.scene;
   let verts=0,tri=0,skinned=0,bones=0;
   fresh.traverse(n=>{if(n.isMesh){verts+=n.geometry.attributes.position.count;tri+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;if(n.isSkinnedMesh)skinned++}if(n.isBone)bones++});
   if(verts!==12240||tri!==24454)throw Error('Topology mismatch after GLB import: '+verts+' / '+tri);
   if(kind!=='static'&&(skinned<1||bones<17||gltf.animations.length<2))throw Error('Rig not complete: '+skinned+' skinned meshes / '+bones+' bones / '+gltf.animations.length+' clips');
   if(model)scene.remove(model);
   model=fresh;scene.add(model);loaded=true;wire=false;
   clips=gltf.animations;mixer=clips.length?new THREE.AnimationMixer(model):null;
   for(const id of ['clipIdle','clipWalk','clipStop'])$(id).disabled=!mixer;
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
