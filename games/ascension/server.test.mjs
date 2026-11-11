import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer as createNetServer} from 'node:net';

async function freePort(){
 const server=createNetServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const {port}=server.address();
 await new Promise(resolve=>server.close(resolve));
 return port;
}
const run={schema:'ascension.friend-run.v1',game:'ASCENSION',version:1,height:420,relics:3,duration:1,samples:[[0,0,.5],[.5,210,.55],[1,420,.6]]};

test('hosted friend challenge creates and retrieves a validated, expiring run',async()=>{
 const port=await freePort(),child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
 const base='http://127.0.0.1:'+port;
 try{
  let ready=false;
  for(let i=0;i<50&&!ready;i++){
   try{const r=await fetch(base+'/');ready=r.ok}catch{}
   if(!ready)await new Promise(resolve=>setTimeout(resolve,50));
  }
  assert.equal(ready,true,'server should start');
  const created=await fetch(base+'/api/challenges',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({run})});
  assert.equal(created.status,201);
  const item=await created.json();
  assert.match(item.id,/^[a-f0-9]{20}$/);
  assert.ok(item.expiresAt>Date.now());
  const fetched=await fetch(base+'/api/challenges/'+item.id);
  assert.equal(fetched.status,200);
  const payload=await fetched.json();
  assert.deepEqual(payload.run.samples,run.samples);
  assert.equal(payload.run.height,420);
  const missing=await fetch(base+'/api/challenges/00000000000000000000');
  assert.equal(missing.status,404);
 }finally{child.kill('SIGTERM')}
});

test('hosted friend challenge rejects invalid client-submitted replay data',async()=>{
 const port=await freePort(),child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
 const base='http://127.0.0.1:'+port;
 try{
  let ready=false;
  for(let i=0;i<50&&!ready;i++){try{ready=(await fetch(base+'/')).ok}catch{}if(!ready)await new Promise(resolve=>setTimeout(resolve,50))}
  assert.equal(ready,true);
  const response=await fetch(base+'/api/challenges',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({run:{...run,samples:[[0,0,2],[1,420,.6]]}})});
  assert.equal(response.status,400);
 }finally{child.kill('SIGTERM')}
});
