/** Offline deterministic Merkle inclusion proofs for test transaction IDs.
 * No transaction execution, consensus or production finality.
 */
const enc=new TextEncoder(),hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const sha=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const validId=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const leaf=async id=>sha('earthchain.offline.leaf.v0:'+id);
const parent=async(a,b)=>sha('earthchain.offline.node.v0:'+a+':'+b);
export async function buildTestMerkle(ids){
 if(!Array.isArray(ids)||ids.length<1||ids.length>4096||ids.some(id=>!validId(id))||new Set(ids).size!==ids.length)throw Error('Invalid test transaction IDs');
 let level=await Promise.all(ids.map(leaf));const levels=[level];
 while(level.length>1){const next=[];for(let i=0;i<level.length;i+=2)next.push(await parent(level[i],level[i+1]??level[i]));level=next;levels.push(level)}
 return Object.freeze({root:level[0],levels});
}
export async function testInclusionProof(ids,index){
 if(!Number.isSafeInteger(index)||index<0||index>=ids.length)throw Error('Invalid index');
 const tree=await buildTestMerkle(ids);const siblings=[];let i=index;
 for(const level of tree.levels.slice(0,-1)){const sibling=i^1;siblings.push({hash:level[sibling]??level[i],side:i%2===0?'right':'left'});i=Math.floor(i/2)}
 return Object.freeze({transactionId:ids[index],index,count:ids.length,siblings,root:tree.root});
}
export async function verifyTestInclusion(proof,expectedRoot){
 if(!proof||!validId(proof.transactionId)||!validId(expectedRoot)||proof.root!==expectedRoot||!Number.isSafeInteger(proof.count)||proof.count<1||proof.count>4096||!Number.isSafeInteger(proof.index)||proof.index<0||proof.index>=proof.count||!Array.isArray(proof.siblings))return false;
 let depth=0,n=proof.count;while(n>1){n=Math.ceil(n/2);depth++}
 if(proof.siblings.length!==depth)return false;
 let current=await leaf(proof.transactionId),i=proof.index;
 for(const s of proof.siblings){if(!validId(s?.hash)||s.side!==(i%2===0?'right':'left'))return false;current=s.side==='right'?await parent(current,s.hash):await parent(s.hash,current);i=Math.floor(i/2)}
 return current===expectedRoot;
}
