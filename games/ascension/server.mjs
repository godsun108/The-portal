import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root=resolve('.');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const rel=pathname==='/'?'/index.html':pathname;
  const file=resolve(root,'.'+rel);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return}
  const body=await readFile(file);
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(body);
 }catch{res.writeHead(404,{'content-type':'text/plain'});res.end('Not found')}
});
server.listen(Number(process.env.PORT)||8080,'0.0.0.0',()=>console.log('ASCENSION preview listening'));
