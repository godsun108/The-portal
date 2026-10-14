// Browser / Node-compatible Pocket CI contract checks. No eval, network, or persisted secrets.
export const PROFILES = Object.freeze({'command-center':3,foundry:5,'genesis-smoke':1,'oracle-q-smoke':2});
export const STATUSES = Object.freeze(['pass','fail','timeout','unavailable']);
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
export function inspectReport(data){
  const checks=[];
  const check=(label,ok)=>checks.push({label,passed:Boolean(ok)});
  const object=data!==null && typeof data==='object' && !Array.isArray(data);
  check('Report is a JSON object',object);
  if(!object) return {passed:false,checks,kind:'invalid'};
  const profile=data.profile;
  const expected=own(PROFILES,profile)?PROFILES[profile]:null;
  check('Known verification profile',expected!==null);
  const items=Array.isArray(data.results)?data.results:null;
  check('Exact expected test count',expected!==null && items!==null && items.length===expected);
  const valid=items!==null && items.every(item=>item && typeof item==='object' && !Array.isArray(item) && STATUSES.includes(item.status));
  check('All check statuses recognized',valid);
  check('Passed count agrees with results',valid && Number.isInteger(data.passed) && data.passed===items.filter(i=>i.status==='pass').length);
  check('Total count agrees with results',items!==null && Number.isInteger(data.total) && data.total===items.length);
  let timestampValid=false;
  if(typeof data.timestamp_utc==='string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(data.timestamp_utc)){
    timestampValid=Number.isFinite(Date.parse(data.timestamp_utc));
  }
  check('Timestamp has timezone',timestampValid);
  const complete=checks.every(item=>item.passed);
  const allPass=complete && items.every(item=>item.status==='pass');
  return {passed:complete,checks,kind:complete?(allPass?'untrusted-pass-report':'untrusted-failure-report'):'invalid'};
}
export function selfTest(){
  const now='2026-10-13T21:00:00+00:00';
  const valid={profile:'genesis-smoke',passed:1,total:1,timestamp_utc:now,results:[{status:'pass'}]};
  const cases=[
    ['valid fixture accepted',()=>inspectReport(valid).kind==='untrusted-pass-report'],
    ['failed test not green',()=>inspectReport({...valid,passed:0,results:[{status:'fail'}]}).kind==='untrusted-failure-report'],
    ['false pass count rejected',()=>!inspectReport({...valid,passed:0}).passed],
    ['unknown profile rejected',()=>!inspectReport({...valid,profile:'not-real'}).passed],
    ['missing result rejected',()=>!inspectReport({...valid,results:[]}).passed],
    ['unsupported status rejected',()=>!inspectReport({...valid,results:[{status:'skipped'}]}).passed],
    ['unzoned timestamp rejected',()=>!inspectReport({...valid,timestamp_utc:'2026-10-13T21:00:00'}).passed],
    ['null report rejected',()=>!inspectReport(null).passed],
    ['non-object report rejected',()=>!inspectReport('pass').passed],
    ['rejected stale count',()=>!inspectReport({...valid,total:2}).passed],
  ];
  const checks=cases.map(([label,test])=>{try{return {label,passed:Boolean(test())}}catch(_){return {label,passed:false}}});
  return {checks,passed:checks.every(x=>x.passed)};
}
