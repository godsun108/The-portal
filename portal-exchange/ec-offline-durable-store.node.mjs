/** Node.js offline durable snapshot store (research only).
 * Writes a same-directory temporary file, fsyncs it, renames atomically,
 * then fsyncs the containing directory before acknowledging durability.
 * Guarantees depend on filesystem/OS semantics; no malicious rollback defense.
 */
import {open,readFile,rename,unlink,mkdir} from 'node:fs/promises';
import {dirname,basename,join} from 'node:path';
import {randomUUID} from 'node:crypto';
export function createOfflineDurableStore(path){
 if(typeof path!=='string'||!path.endsWith('.json'))throw Error('Invalid store path');
 return Object.freeze({
  async saveDurably(snapshot){
   if(typeof snapshot!=='string'||snapshot.length>2000000)throw Error('Invalid snapshot bytes');
   const dir=dirname(path),tmp=join(dir,'.'+basename(path)+'.'+randomUUID()+'.tmp');
   await mkdir(dir,{recursive:true});
   let file;
   try{
    file=await open(tmp,'wx',0o600);
    await file.writeFile(snapshot,'utf8');
    await file.sync();
    await file.close();file=undefined;
    await rename(tmp,path);
    const directory=await open(dir,'r');
    try{await directory.sync()}finally{await directory.close()}
    return {durable:true};
   }finally{
    if(file)await file.close().catch(()=>{});
    await unlink(tmp).catch(()=>{});
   }
  },
  async load(){return readFile(path,'utf8')}
 });
}
