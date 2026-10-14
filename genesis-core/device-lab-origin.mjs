/* EarthID development origin gate. Read-only configuration validator.
 * Do not bind public ports or deploy solely because this function succeeds.
 */
const forbidden=new Set(["localhost","127.0.0.1","0.0.0.0","::1"]);
function normalizeHost(host){return host.toLowerCase().replace(/\.$/,"");}
export function validateDeviceLabOrigin({origin,rpID}={}){
 if(typeof origin!=="string"||typeof rpID!=="string")throw new TypeError("origin and rpID required");
 let url;
 try{url=new URL(origin);}catch{throw new TypeError("invalid HTTPS origin");}
 if(url.protocol!=="https:"||url.origin!==origin||url.username||url.password||
  url.pathname!=="/"||url.search||url.hash||url.port)
  throw new TypeError("canonical HTTPS origin required");
 const host=normalizeHost(url.hostname),rp=normalizeHost(rpID);
 if(!/^[a-z0-9.-]+$/.test(host)||!/^[a-z0-9.-]+$/.test(rp)||host.includes("..")||rp.includes(".."))
  throw new TypeError("invalid hostname");
 if(forbidden.has(host)||forbidden.has(rp)||host.endsWith(".local")||rp.endsWith(".local"))
  throw new TypeError("public HTTPS hostname required");
 if(!(host===rp||host.endsWith("."+rp)))throw new TypeError("RP ID must equal or be a parent of the HTTPS host");
 // This host is a static project site, NOT an operator-controlled private API.
 if(host==="godsun108.github.io"||rp==="github.io"||rp==="godsun108.github.io")
  throw new TypeError("GitHub Pages preview is not a private EarthID RP");
 return Object.freeze({origin:url.origin,rpID:rp,hostname:host});
}
