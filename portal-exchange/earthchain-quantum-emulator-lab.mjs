/** Small exact state-vector emulator for educational quantum circuits.
 * Classical CPU simulation, not quantum hardware or cryptographic security.
 * Exponential memory: hard cap 12 qubits.
 */
const LIMIT=12;
export function createQuantumRegister(qubits){
 if(!Number.isInteger(qubits)||qubits<1||qubits>LIMIT)throw Error('Qubit count outside emulator limit');
 const re=new Float64Array(2**qubits),im=new Float64Array(2**qubits);re[0]=1;
 return {qubits,re,im};
}
function check(reg,target){if(!Number.isInteger(target)||target<0||target>=reg.qubits)throw Error('Invalid target qubit');}
export function hadamard(reg,target){
 check(reg,target);const bit=2**target,scale=1/Math.sqrt(2);
 for(let i=0;i<reg.re.length;i++)if((i&bit)===0){
  const j=i|bit,a=reg.re[i],b=reg.re[j],c=reg.im[i],d=reg.im[j];
  reg.re[i]=(a+b)*scale;reg.re[j]=(a-b)*scale;
  reg.im[i]=(c+d)*scale;reg.im[j]=(c-d)*scale;
 }
 return reg;
}
export function controlledNot(reg,control,target){
 check(reg,control);check(reg,target);if(control===target)throw Error('Control equals target');
 const c=2**control,t=2**target;
 for(let i=0;i<reg.re.length;i++)if((i&c)!==0&&(i&t)===0){
  const j=i|t;[reg.re[i],reg.re[j]]=[reg.re[j],reg.re[i]];[reg.im[i],reg.im[j]]=[reg.im[j],reg.im[i]];
 }
 return reg;
}
export function probabilities(reg){return Array.from(reg.re,(r,i)=>r*r+reg.im[i]*reg.im[i]);}
