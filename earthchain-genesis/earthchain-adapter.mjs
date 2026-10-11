/** EarthChain ECTEST public discovery only. No credentials, sessions, or money movement. */
export const CHECKOUT_ORIGIN="https://earthchain-test-checkout-production.up.railway.app";
export function validateInfo(value){
 if(!value||value.schema!=="earthchain.checkout-info.v1"||value.asset!=="ECTEST"||value.realFunds!==false||typeof value.network!=="string"||!value.network.startsWith("EARTHCHAIN_COMMERCE_TEST_")||typeof value.publicKey!=="string"||!value.publicKey.includes("BEGIN PUBLIC KEY"))throw new Error("unexpected_test_checkout_identity");
 return {asset:value.asset,network:value.network,realFunds:false,schema:value.schema};
}
export async function discoverTestCheckout(fetcher=fetch,{signal}={}){
 const response=await fetcher(CHECKOUT_ORIGIN+"/info",{method:"GET",headers:{Accept:"application/json"},signal,mode:"cors",credentials:"omit",cache:"no-store"});
 if(!response.ok)throw new Error("checkout_unavailable");
 return validateInfo(await response.json());
}
