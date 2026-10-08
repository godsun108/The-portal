import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id),canvas=$('view');
function report(message){$('status').textContent=message;$('log').textContent+='\n'+message}
try {
 const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(480,640,false);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.1;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x172439);
 const camera=new THREE.PerspectiveCamera(35,.75,.001,1000);
 const control=new OrbitControls(camera,canvas);control.enableDamping=true;control.enablePan=false;
 scene.add(new THREE.HemisphereLight(0xeaf5ff,0x4e5c70,2));
 const key=new THREE.DirectionalLight(0xffeadb,2.8);key.position.set(3,4,6);scene.add(key);
 const rim=new THREE.DirectionalLight(0xb4d4ff,1.3);rim.position.set(-3,4,-3);scene.add(rim);
 const timer=new THREE.Clock();
 let subject=null,radius=1,target=new THREE.Vector3(),wire=false,loaded=false,manifest=null;
 function angle(a){
  let yaw=a==='side'?Math.PI/2:a==='back'?Math.PI:a==='threequarter'?Math.PI/4:0;
  const distance=Math.max(.05,radius*2.45);
  camera.position.copy(target).add(new THREE.Vector3(Math.sin(yaw)*distance,radius*.12,Math.cos(yaw)*distance));
  camera.near=Math.max(.0001,radius/1000);camera.far=Math.max(50,radius*20);
  camera.updateProjectionMatrix();control.target.copy(target);control.update();camera.lookAt(target);
 }
 function frame(){requestAnimationFrame(frame);control.update();renderer.render(scene,camera)}requestAnimationFrame(frame);
 document.querySelectorAll('[data-angle]').forEach(button=>button.onclick=()=>{if(subject){angle(button.dataset.angle);report('VIEW '+button.dataset.angle)}});
 $('wire').onclick=()=>{if(!subject)return report('Load a body before wireframe');wire=!wire;subject.traverse(n=>{if(n.isMesh){n.material.wireframe=wire}});report('WIREFRAME '+(wire?'ON':'OFF'))};
 $('load').disabled=false;report('3D renderer ready. Tap Load CC0 Human Base.');
 $('load').onclick=async()=>{
  $('load').disabled=true;
  try {
   report('Fetching upstream mesh manifest and GLB…');
   const response=await fetch('./assets/manifest.json?rev=1',{cache:'no-store'});
   if(!response.ok)throw Error('Manifest HTTP '+response.status+' — build may be publishing');
   const info=await response.json();
   if(!info.source_commit||info.rigged!==false||info.photoreal!==false||info.triangles<1000||info.uv_entries<100)throw Error('Source manifest does not meet anatomical import requirements');
   const imported=await new GLTFLoader().loadAsync('./assets/makehuman-base-static.glb?rev=1');
   let triangles=0,vertices=0,uvs=0,rigs=0;
   imported.scene.traverse(n=>{
    if(n.isMesh){const g=n.geometry;triangles+=(g.index?.count||g.attributes.position.count)/3;vertices+=g.attributes.position.count;if(g.attributes.uv)uvs+=g.attributes.uv.count;if(n.isSkinnedMesh)rigs++}
   });
   if(triangles!==info.triangles||vertices!==info.exported_vertices||rigs!==0||uvs<100)throw Error('Mesh import did not match manifest geometry');
   if(subject)scene.remove(subject);
   subject=imported.scene;scene.add(subject);loaded=true;manifest=info;wire=false;
   const bounds=new THREE.Box3().setFromObject(subject);const size=new THREE.Vector3();bounds.getSize(size);bounds.getCenter(target);
   radius=Math.max(.01,size.length()*.57);angle('threequarter');
   $('stats').textContent='PASS: '+triangles.toLocaleString()+' triangles · '+vertices.toLocaleString()+' indexed/UV vertices · '+info.original_vertices.toLocaleString()+' source vertices · '+info.uv_entries.toLocaleString()+' UV entries · static / unrigged';
   report('PASS: Actual MakeHuman CC0 anatomical mesh and UVs loaded; no animations claimed.');
  }catch(error){$('load').disabled=false;report('LOAD FAILED: '+(error?.message||error))}
 };
 $('capture').onclick=()=>{
  if(!loaded)return report('Load anatomical mesh before capturing');
  const sheet=document.createElement('canvas');sheet.width=960;sheet.height=1280;
  const c=sheet.getContext('2d');c.fillStyle='#172439';c.fillRect(0,0,960,1280);
  ['front','threequarter','side','back'].forEach((name,i)=>{
   angle(name);renderer.render(scene,camera);
   const x=(i%2)*480,y=Math.floor(i/2)*640;
   c.drawImage(canvas,x,y,480,640);
   c.fillStyle='white';c.font='22px system-ui';c.fillText(name.toUpperCase(),x+18,y+35);
  });
  sheet.toBlob(blob=>{
   if(!blob)return report('PNG capture failed');
   if(window._eidolonURL)URL.revokeObjectURL(window._eidolonURL);
   const url=URL.createObjectURL(blob);window._eidolonURL=url;
   $('proof').src=url;$('prooflink').href=url;$('prooflink').download='eidolon-makehuman-base-four-view.png';
   $('proofpanel').hidden=false;
   report('Four-angle GLB inspection PNG ready; save it to Files or long press image.');
   $('proofpanel').scrollIntoView({behavior:'smooth',block:'start'});
  },'image/png');
 };
} catch(error){report('WEBGL FAILED: '+(error?.message||error))}
