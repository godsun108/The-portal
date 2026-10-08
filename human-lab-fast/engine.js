
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const report=s=>{document.getElementById('log').textContent+='\n'+s;document.getElementById('status').textContent=s},canvas=document.getElementById('view');
try{
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(480,640,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x18253a);const camera=new THREE.PerspectiveCamera(38,480/640,.1,100);camera.position.set(0,1.45,4.5);camera.lookAt(0,1.4,0);scene.add(new THREE.HemisphereLight(0xffffff,0x445566,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-2,4,4);scene.add(light);
const placeholder=new THREE.Mesh(new THREE.BoxGeometry(.9,1.5,.5),new THREE.MeshStandardMaterial({color:0x73a8da,roughness:.65}));placeholder.position.y=1.4;scene.add(placeholder);let imported=null,mixer=null,actorMotion=false,actorStart=0;const loader=new GLTFLoader();let last=performance.now(),frame=0;
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;placeholder.rotation.y+=dt*.25;if(mixer)mixer.update(dt);if(actorMotion&&imported){const t=(now-actorStart)/1000;if(imported.userData.mouth){imported.userData.mouth.scale.y=.013*(1+1.3*Math.max(0,Math.sin(t*3)));const blink=Math.pow(Math.max(0,Math.cos(t*2.4)),32);for(const eye of imported.userData.eyes||[])eye.scale.y=.025*(1-.90*blink);for(const brow of imported.userData.brows||[])brow.position.y=.225+.013*Math.sin(t*1.5)}const gait=Math.sin(t*5);imported.rotation.y=.25*Math.sin(t*.7);imported.position.x=.16*Math.sin(t*.9);imported.traverse(n=>{if(n.name==="arm_l")n.rotation.x=.45*gait;if(n.name==="arm_r")n.rotation.x=-.45*gait;if(n.name==="leg_l")n.rotation.x=-.35*gait;if(n.name==="leg_r")n.rotation.x=.35*gait;if(n.name==="head")n.rotation.y=.12*Math.sin(t*1.2);if(n.name.startsWith('elbow_'))n.rotation.x=.2+.12*Math.sin(t*5);if(n.name.startsWith('knee_'))n.rotation.x=Math.max(0,.45*Math.sin(t*5+(n.name.endsWith('_l')?0:Math.PI)));});}renderer.render(scene,camera);frame++;if(frame===30)report('PASS: WebGL scene running; GLTFLoader imported');requestAnimationFrame(tick)}requestAnimationFrame(tick);
document.getElementById('file').onchange=()=>{const file=document.getElementById('file').files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith('.glb'))return report('Only .glb supported');if(file.size>60e6)return report('File exceeds 60 MB phone-test limit');const url=URL.createObjectURL(file);report('Parsing '+file.name);loader.load(url,gltf=>{try{const model=gltf.scene,box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());if(!Number.isFinite(size.y)||size.y<=0)throw Error('Invalid model bounds');if(imported)scene.remove(imported);actorMotion=false;model.position.sub(center);model.scale.multiplyScalar(2.7/size.y);model.position.y+=1.4;scene.add(model);imported=model;placeholder.visible=false;mixer=gltf.animations.length?new THREE.AnimationMixer(model):null;if(mixer)mixer.clipAction(gltf.animations[0]).play();report('PASS: '+file.name+' · animations '+gltf.animations.length+' · meshes '+model.getObjectByProperty('isMesh',true)?.name)}catch(e){report('Model setup failed: '+e.message)}finally{URL.revokeObjectURL(url)}},undefined,e=>{report('GLB parse failed: '+e.message);URL.revokeObjectURL(url)})};

function generateDiagnosticGLB(){
 const parts=[
 ['torso',[0,1.48,0],[.50,.72,.28],[.34,.48,.66,1]],
 ['neck',[0,2.02,0],[.15,.18,.15],[.65,.44,.32,1]],
 ['head',[0,2.36,0],[.35,.43,.32],[.65,.44,.32,1]],
 ['arm_l',[-.68,1.55,0],[.20,.80,.22],[.35,.48,.65,1]],
 ['arm_r',[.68,1.55,0],[.20,.80,.22],[.35,.48,.65,1]],
 ['leg_l',[-.25,.58,0],[.24,1.16,.25],[.20,.26,.39,1]],
 ['leg_r',[.25,.58,0],[.24,1.16,.25],[.20,.26,.39,1]]];
 const corners=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
 const triangles=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,2,3,7,2,7,6,1,2,6,1,6,5,3,0,4,3,4,7];
 const pieces=[],views=[],accessors=[],meshes=[],nodes=[],materials=[];let length=0;
 function add(bytes,target){const padding=(4-length%4)%4;if(padding){pieces.push(new Uint8Array(padding));length+=padding}const offset=length;pieces.push(bytes);length+=bytes.length;views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});return views.length-1}
 for(const [name,center,scale,rgba] of parts){
  const coords=new Float32Array(corners.flat());const idx=new Uint16Array(triangles);
  const pv=add(new Uint8Array(coords.buffer),34962),iv=add(new Uint8Array(idx.buffer),34963);
  const p=accessors.length;accessors.push({bufferView:pv,componentType:5126,count:8,type:'VEC3',min:[-.5,-.5,-.5],max:[.5,.5,.5]});
  const i=accessors.length;accessors.push({bufferView:iv,componentType:5123,count:36,type:'SCALAR'});
  const m=materials.length;materials.push({name,pbrMetallicRoughness:{baseColorFactor:rgba,metallicFactor:0,roughnessFactor:.85},doubleSided:true});
  const mesh=meshes.length;meshes.push({name,primitives:[{attributes:{POSITION:p},indices:i,material:m}]});
  nodes.push({name,mesh,translation:center,scale});
 }
 const binary=new Uint8Array(length);let cursor=0;for(const p of pieces){binary.set(p,cursor);cursor+=p.length}
 const doc={asset:{version:'2.0',generator:'EIDOLON phone diagnostic exporter v1'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials,buffers:[{byteLength:length}],bufferViews:views,accessors,extras:{character_id:'eidolon-diagnostic-001',certification:'diagnostic only',rigged:false,photorealistic:false}};
 const encoder=new TextEncoder(),raw=encoder.encode(JSON.stringify(doc)),jsonSize=Math.ceil(raw.length/4)*4,total=12+8+jsonSize+8+binary.length;
 const out=new ArrayBuffer(total),dv=new DataView(out),u=new Uint8Array(out);let o=0;
 function word(v){dv.setUint32(o,v,true);o+=4}
 word(0x46546c67);word(2);word(total);word(jsonSize);word(0x4e4f534a);u.fill(32,o,o+jsonSize);u.set(raw,o);o+=jsonSize;word(binary.length);word(0x004e4942);u.set(binary,o);
 return out
}
function buildV2(){
 const cfg=window.eidolonConfig||{skin:'#c48e73',shirt:'#527e9f',pants:'#34445e',build:'standard',hair:'short'};const root=new THREE.Group();root.name='EIDOLON_V11';const skin=new THREE.MeshStandardMaterial({color:cfg.skin,roughness:.85,skinning:true}),cloth=new THREE.MeshStandardMaterial({color:cfg.shirt,roughness:.92,skinning:true}),pants=new THREE.MeshStandardMaterial({color:cfg.pants,roughness:.95,skinning:true}),hair=new THREE.MeshStandardMaterial({color:0x2b211f,roughness:1}),eyeMat=new THREE.MeshStandardMaterial({color:0x18191d,roughness:.3});
 function ell(parent,name,x,y,z,sx,sy,sz,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat);m.name=name;m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
 // Each limb is a single skinned cylinder, smoothly deformed by shoulder/hip and elbow/knee bones.
 function limb(name,side,upper,lower,origin,material,r1,r2){
  const bones=[new THREE.Bone(),new THREE.Bone()];bones[0].name=name;bones[1].name=(upper?'elbow_':'knee_')+(side<0?'l':'r');
  bones[0].position.set(...origin);bones[1].position.y=-.52;bones[0].add(bones[1]);root.add(bones[0]);
  const length=1.06,geo=new THREE.CylinderGeometry(r1,r2,length,14,18,true);
  geo.translate(0,-length/2,0);
  const pos=geo.attributes.position,indices=[],weights=[];
  for(let i=0;i<pos.count;i++){const y=-pos.getY(i);const w=THREE.MathUtils.smoothstep(y,.34,.72);indices.push(0,1,0,0);weights.push(1-w,w,0,0)}
  geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  const mesh=new THREE.SkinnedMesh(geo,material);mesh.name='skinned_'+name;mesh.position.set(...origin);bones[0].position.set(0,0,0);mesh.add(bones[0]);root.remove(bones[0]);root.add(mesh);root.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(bones));
  return {root:bones[0],hinge:bones[1],mesh};
 }
 // Single procedural torso surface: chest/shoulders taper into waist.
 function torsoSurface(){
  const rows=26,sides=40,vertices=[],normals=[],uv=[],idx=[];
  for(let j=0;j<=rows;j++){
   const t=j/rows,y=1.02+t*1.07;
   const waist=0.29,shoulder=.48;
   const shoulderBlend=THREE.MathUtils.smoothstep(t,.34,.83);
   const taper=THREE.MathUtils.smoothstep(t,.88,1);
   const rx=THREE.MathUtils.lerp(waist,shoulder,shoulderBlend)*(1-.44*taper);
   const rz=.205+.055*Math.sin(t*Math.PI);
   for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2;
    vertices.push(Math.cos(a)*rx,y,Math.sin(a)*rz);
    uv.push(k/sides,t);
   }
  }
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const a=j*(sides+1)+k,b=a+sides+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,cloth);m.name='continuous_torso';root.add(m);
 }
 torsoSurface();ell(root,'pelvis',0,1.06,0,.30,.17,.23,pants);ell(root,'neck',0,2.09,0,.12,.17,.12,skin);
 const head=new THREE.Group();head.name='head';head.position.set(0,2.32,0);root.add(head);
 ell(head,'cranium',0,.13,0,.255,.32,.245,skin);if(cfg.hair!=='none')ell(head,'hair',0,cfg.hair==='high'?.41:.36,-.025,.258,cfg.hair==='high'?.20:.14,.248,hair);
 const eyes=[];for(const side of [-1,1])eyes.push(ell(head,'eye_'+(side<0?'l':'r'),side*.095,.16,.229,.035,.025,.015,eyeMat));
 const mouth=ell(head,'mouth',0,-.035,.237,.078,.012,.012,eyeMat);ell(head,'chin',0,-.135,.18,.10,.025,.028,skin);const nose=ell(head,'nose',0,.055,.241,.044,.065,.046,skin);const brows=[];for(const side of [-1,1])brows.push(ell(head,'brow_'+(side<0?'l':'r'),side*.095,.225,.23,.09,.015,.017,hair));
 const limbs={};
 for(const side of [-1,1]){const suffix=side<0?'l':'r';
  limbs['arm_'+suffix]=limb('arm_'+suffix,side,true,false,[side*.43,1.91,0],skin,.128,.092);
  limbs['leg_'+suffix]=limb('leg_'+suffix,side,false,true,[side*.19,1.01,0],pants,.165,.12);
  // Shoulder cap follows the shoulder bone, bridging the torso/upper-arm gap.
  ell(limbs['arm_'+suffix].root,'shoulder_'+suffix,0,-.04,0,.14,.155,.145,cloth);
  // Both accessories are parented to the lower bone, so they follow joint rotation.
  const hand=new THREE.Group();hand.name='hand_'+suffix;hand.position.set(0,-.53,0);limbs['arm_'+suffix].hinge.add(hand);
  ell(hand,'palm_'+suffix,0,-.08,0,.09,.12,.06,skin);
  // Four individual fingers and a thumb, all following the wrist bone.
  for(let finger=0;finger<4;finger++){const x=(finger-1.5)*.041;
   ell(hand,'finger_'+suffix+'_'+finger,x,-.205-(finger===1||finger===2?.014:0),.005,.018,.075+(finger===1||finger===2?.014:0),.023,skin);
  }
  ell(hand,'thumb_'+suffix,side*.091,-.11,.034,.032,.075,.03,skin).rotation.z=side*.55;
  ell(limbs['leg_'+suffix].hinge,'shoe_'+suffix,0,-.54,.11,.145,.095,.25,hair);
 }
 const width=cfg.build==='slim'?.87:cfg.build==='broad'?1.13:1;root.scale.x=width;root.userData={mouth,eyes,brows,limbs,head,nose,skinned:true};
 return root
}
function readConfig(){return {skin:document.getElementById('skincolor').value,shirt:document.getElementById('shirtcolor').value,pants:document.getElementById('pantscolor').value,build:document.getElementById('buildtype').value,hair:document.getElementById('hairtype').value}}
const ROSTER_KEY='eidolon.characters.v11';
let roster=[];
const allowedBuilds=['standard','slim','broad'],allowedHair=['short','none','high'];
function safePreset(x){if(!x||typeof x!=='object')throw Error('Invalid character preset');
 const name=String(x.name||'').trim().slice(0,48);if(!name)throw Error('A character name is required');
 const hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
 const c=x.config;if(!c||!hex(c.skin)||!hex(c.shirt)||!hex(c.pants)||!allowedBuilds.includes(c.build)||!allowedHair.includes(c.hair))throw Error('Invalid appearance fields');
 return {id:String(x.id||'').slice(0,100)||('character-'+Date.now()),name,config:{skin:c.skin,shirt:c.shirt,pants:c.pants,build:c.build,hair:c.hair}};
}
function persistRoster(){try{localStorage.setItem(ROSTER_KEY,JSON.stringify(roster));return true}catch(e){report('LOCAL SAVE FAILED: '+e.message+' · Export a JSON backup instead');return false}}
function refreshRoster(selected=''){const select=document.getElementById('roster');select.replaceChildren();if(!roster.length){select.add(new Option('No saved characters yet',''));return}
 for(const c of roster)select.add(new Option(c.name,c.id));
 if(selected&&roster.some(c=>c.id===selected))select.value=selected;
}
function applyConfig(c){for(const [id,key] of [['skincolor','skin'],['shirtcolor','shirt'],['pantscolor','pants'],['buildtype','build'],['hairtype','hair']])document.getElementById(id).value=c[key]}
try{const raw=localStorage.getItem(ROSTER_KEY);if(raw){const data=JSON.parse(raw);if(Array.isArray(data))roster=data.slice(0,200).map(safePreset)}refreshRoster();report('Character library ready: '+roster.length+' saved performers')}catch(e){report('LIBRARY LOAD FAILED: '+e.message)}
document.getElementById('savechar').onclick=()=>{
 try{const name=document.getElementById('charactername').value.trim();const config=readConfig(),selected=document.getElementById('roster').value;let existing=roster.find(c=>c.id===selected&&c.name.toLowerCase()===name.toLowerCase());if(!existing)existing=roster.find(c=>c.name.toLowerCase()===name.toLowerCase());if(!name)throw Error('Enter a character name');if(!existing&&roster.length>=200)throw Error('Library full (200 presets)');
 const preset=safePreset({id:existing?.id||('character-'+Date.now()+'-'+Math.floor(Math.random()*1e8)),name,config});if(existing)roster[roster.indexOf(existing)]=preset;else roster.push(preset);
 if(persistRoster()){refreshRoster(preset.id);report('SAVED: '+name+' · '+roster.length+' performers; export JSON for backup')}
 }catch(e){report('SAVE FAILED: '+e.message)}
};
document.getElementById('loadchar').onclick=()=>{const preset=roster.find(c=>c.id===document.getElementById('roster').value);if(!preset)return report('Select a saved character');applyConfig(preset.config);document.getElementById('charactername').value=preset.name;document.getElementById('generate').click();report('LOADED: '+preset.name+' · rebuilt from saved appearance')};
document.getElementById('deletechar').onclick=()=>{const select=document.getElementById('roster'),preset=roster.find(c=>c.id===select.value);if(!preset)return report('Select a saved character');if(!confirm('Delete "'+preset.name+'" from this device?'))return;roster=roster.filter(c=>c.id!==preset.id);persistRoster();refreshRoster();report('DELETED: '+preset.name)};
document.getElementById('backup').onclick=()=>{const json=JSON.stringify({format:'eidolon-character-roster',version:1,characters:roster},null,2);const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='eidolon-character-roster.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);report('BACKUP: '+roster.length+' character presets exported to JSON')};
document.getElementById('restore').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>200000)throw Error('JSON backup too large');const data=JSON.parse(await file.text());if(data.format!=='eidolon-character-roster'||data.version!==1||!Array.isArray(data.characters)||data.characters.length>200)throw Error('Unsupported roster format');const incoming=data.characters.map(safePreset);const byId=new Map(roster.map(c=>[c.id,c]));for(const c of incoming)byId.set(c.id,c);if(byId.size>200)throw Error('Combined roster exceeds 200');roster=Array.from(byId.values());if(persistRoster()){refreshRoster();report('RESTORED: '+incoming.length+' presets; total '+roster.length)}}catch(err){report('IMPORT FAILED: '+err.message)}finally{e.target.value=''}};
document.getElementById('randomize').onclick=()=>{
 const colors=['#c48e73','#8b563f','#e2b698','#67422f','#b98261','#d7a77f'],shirts=['#527e9f','#7a4868','#47765c','#c38d42','#353c56'],pants=['#34445e','#303334','#6a594b','#53657a'];
 for(const [id,arr] of [['skincolor',colors],['shirtcolor',shirts],['pantscolor',pants]])document.getElementById(id).value=arr[Math.floor(Math.random()*arr.length)];
 for(const [id,arr] of [['buildtype',['standard','slim','broad']],['hairtype',['short','none','high']]])document.getElementById(id).value=arr[Math.floor(Math.random()*arr.length)];
 report('New variation selected; tap Build Human V11');
};
document.getElementById('generate').onclick=()=>{window.eidolonConfig=readConfig();
 try{if(imported)scene.remove(imported);const model=buildV2(),box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());model.position.sub(center);model.scale.multiplyScalar(2.7/size.y);model.position.y+=1.4;scene.add(model);imported=model;placeholder.visible=false;actorMotion=false;mixer=null;report('V11 assembled: custom character · ready for roster saving and GLB export')}
 catch(e){report('V2 build error: '+e.message)}
};
document.getElementById('animate').onclick=()=>{if(!imported){report('Generate a human first');return}actorMotion=!actorMotion;actorStart=performance.now();if(!actorMotion){imported.rotation.set(0,0,0);imported.position.x=0;imported.traverse(n=>{if(['arm_l','arm_r','leg_l','leg_r','head','elbow_l','elbow_r','knee_l','knee_r'].includes(n.name))n.rotation.set(0,0,0)})}report(actorMotion?'PASS: Procedural walk/turn animation running':'Animation stopped')};
function makeExportClips(model){
 const targets=['arm_l','arm_r','leg_l','leg_r','elbow_l','elbow_r','knee_l','knee_r','head'];
 const times=Array.from({length:17},(_,i)=>i/16);
 function tracksFor(mode){
  return targets.flatMap(name=>{
   if(!model.getObjectByName(name))return [];
   const values=[];
   for(const t of times){
    const phase=t*Math.PI*2,side=name.endsWith('_l')?0:Math.PI;
    let angle=0,axis='x';
    if(mode==='walk'){
     if(name.startsWith('arm_'))angle=.34*Math.sin(phase+side+Math.PI);
     if(name.startsWith('leg_'))angle=.38*Math.sin(phase+side);
     if(name.startsWith('knee_'))angle=.42*Math.pow(Math.max(0,Math.sin(phase+side-Math.PI/3)),2);
     if(name.startsWith('elbow_'))angle=-.14-.08*Math.max(0,Math.sin(phase+side));
     if(name==='head'){axis='y';angle=.035*Math.sin(phase);}
    }else if(name==='head'){axis='y';angle=.025*Math.sin(phase);}
    const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(axis==='x'?1:0,axis==='y'?1:0,0),angle);
    values.push(q.x,q.y,q.z,q.w);
   }
   return [new THREE.QuaternionKeyframeTrack(name+'.quaternion',times,values)];
  });
 }
 return [new THREE.AnimationClip('EIDOLON_Idle',1,tracksFor('idle')),new THREE.AnimationClip('EIDOLON_Walk',1,tracksFor('walk'))];
}
document.getElementById('export').onclick=async()=>{
 if(!imported||!imported.userData.skinned)return report('Build Human V11 before exporting');
 const button=document.getElementById('export');button.disabled=true;
 try{
  const wasMoving=actorMotion;actorMotion=false;
  // Export at bind/rest pose to avoid embedding transient procedural motion.
  imported.rotation.set(0,0,0);imported.position.x=0;
  imported.traverse(n=>{if(['arm_l','arm_r','leg_l','leg_r','head','elbow_l','elbow_r','knee_l','knee_r'].includes(n.name))n.rotation.set(0,0,0)});
  imported.updateMatrixWorld(true);
  report('Exporting GLB with GLTFExporter…');
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
  const exporter=new GLTFExporter();
  const clips=makeExportClips(imported);const data=await exporter.parseAsync(imported,{binary:true,onlyVisible:true,trs:true,animations:clips});
  if(!(data instanceof ArrayBuffer))throw Error('Expected binary GLB ArrayBuffer');
  report('GLB created: '+data.byteLength+' bytes; validating with GLTFLoader…');
  const parsed=await new Promise((resolve,reject)=>loader.parse(data,'',resolve,reject));
  let skinned=0,bones=0,meshes=0;parsed.scene.traverse(n=>{if(n.isSkinnedMesh)skinned++;if(n.isBone)bones++;if(n.isMesh)meshes++});
  if(skinned<4||bones<8)throw Error('Rig roundtrip incomplete: '+skinned+' skinned meshes / '+bones+' bones');if(parsed.animations.length<2)throw Error('Animation clips missing after roundtrip: '+parsed.animations.length);
  report('PASS: GLB roundtrip · '+skinned+' skinned meshes · '+bones+' bones · '+meshes+' meshes · '+parsed.animations.length+' animation clips: '+parsed.animations.map(c=>c.name).join(', '));
  const blob=new Blob([data],{type:'model/gltf-binary'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='eidolon-v11-roster.glb';a.textContent='Download verified EIDOLON V11 GLB';a.style.display='block';a.style.margin='12px 0';a.id='eidolon-v11-download';
  document.getElementById(a.id)?.remove();document.getElementById('log').after(a);
  // Retain URL for the download link; release previous URL on a new export.
  if(window.__eidolonExportURL)URL.revokeObjectURL(window.__eidolonExportURL);window.__eidolonExportURL=url;
 }catch(e){report('EXPORT FAILED: '+(e?.message||e))}
 finally{button.disabled=false}
};
document.getElementById('reset').onclick=()=>{actorMotion=false;if(imported)scene.remove(imported);imported=null;mixer=null;placeholder.visible=true;report('Reset complete')};
let currentPngBlob=null,currentPngUrl=null;
document.getElementById('snapshot').onclick=()=>{
 const btn=document.getElementById('snapshot');btn.disabled=true;
 try{
  // Render synchronously immediately before capture so the PNG is never an empty backbuffer.
  renderer.render(scene,camera);
  canvas.toBlob(blob=>{
   btn.disabled=false;
   if(!blob){report('PNG FAILED: Browser returned an empty image');return}
   if(currentPngUrl)URL.revokeObjectURL(currentPngUrl);
   currentPngBlob=blob;currentPngUrl=URL.createObjectURL(blob);
   const img=document.getElementById('pngpreview'),panel=document.getElementById('pngpanel'),link=document.getElementById('pngdownload');
   img.src=currentPngUrl;link.href=currentPngUrl;
   link.download='eidolon-character.png';
   panel.hidden=false;document.getElementById('pngmessage').textContent='PNG generated: '+Math.round(blob.size/1024)+' KB. Touch and hold the image to save it.';
   panel.scrollIntoView({behavior:'smooth',block:'start'});
   report('PASS: PNG captured and previewed ('+blob.size+' bytes). Long-press image or use Share PNG.');
  },'image/png');
 }catch(e){btn.disabled=false;report('PNG FAILED: '+e.message)}
};
document.getElementById('pngshare').onclick=async()=>{
 if(!currentPngBlob)return;
 try{
  const file=new File([currentPngBlob],'eidolon-character.png',{type:'image/png'});
  if(!navigator.share||!navigator.canShare?.({files:[file]})){document.getElementById('pngmessage').textContent='Sharing PNG is not supported here. Touch and hold the preview to save it.';return}
  await navigator.share({files:[file],title:'EIDOLON character PNG'});
  report('PNG share sheet opened');
 }catch(e){if(e.name!=='AbortError')document.getElementById('pngmessage').textContent='Share unavailable: '+e.message+' · Long-press preview to save.'}
};
document.getElementById('pngclose').onclick=()=>{document.getElementById('pngpanel').hidden=true};
report('PASS: modules loaded; starting WebGL');
}catch(e){report('Renderer failed: '+e.message)}
