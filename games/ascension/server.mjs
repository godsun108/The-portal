import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {validateFriendRun} from './friend-run.mjs';

const root=resolve('.');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const MAX_BODY=2_000_000,TTL=24*60*60*1000,MAX_CHALLENGES=1000;
const challenges=new Map(),rate=new Map();
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body))};
function limited(ip){const now=Date.now(),slot=rate.get(ip)||{start:now,count:0};if(now-slot.start>60_000){slot.start=now;slot.count=0}slot.count++;rate.set(ip,slot);return slot.count>20}
async function bodyJson(req){let size=0,parts=[];for await(const part of req){size+=part.length;if(size>MAX_BODY)throw Object.assign(Error('payload_too_large'),{status:413});parts.push(part)}try{return JSON.parse(Buffer.concat(parts).toString('utf8'))}catch{throw Object.assign(Error('invalid_json'),{status:400})}}
function prune(){const now=Date.now();for(const [id,item] of challenges)if(item.expiresAt<=now)challenges.delete(id);while(challenges.size>=MAX_CHALLENGES)challenges.delete(challenges.keys().next().value)}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname),ip=req.socket.remoteAddress||'unknown';
  if(pathname==='/api/challenges'&&req.method==='POST'){
   if(limited(ip))return send(res,429,{error:'rate_limited'});
   const input=await bodyJson(req),run=validateFriendRun(input.run);
   prune();const id=randomUUID().replaceAll('-','').slice(0,20),createdAt=Date.now(),expiresAt=createdAt+TTL;
   challenges.set(id,{run,createdAt,expiresAt});
   return send(res,201,{id,createdAt,expiresAt,sharePath:'?challenge='+id});
  }
  const match=pathname.match(/^\/api\/challenges\/([a-f0-9]{20})$/);
  if(match&&req.method==='GET'){
   const item=challenges.get(match[1]);if(!item||item.expiresAt<=Date.now()){challenges.delete(match[1]);return send(res,404,{error:'challenge_not_found_or_expired'})}
   return send(res,200,{run:item.run,createdAt:item.createdAt,expiresAt:item.expiresAt});
  }
  if(pathname.startsWith('/api/'))return send(res,404,{error:'not_found'});
  const rel=pathname==='/'?'/index.html':pathname,file=resolve(root,'.'+rel);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return}
  const content=await readFile(file);
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(content);
 }catch(error){if(!res.headersSent)send(res,error.status||400,{error:error.message||'bad_request'})}
});
server.listen(Number(process.env.PORT)||8080,'0.0.0.0',()=>console.log('ASCENSION preview listening'));
