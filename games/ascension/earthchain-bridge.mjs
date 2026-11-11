/**
 * ASCENSION reads the EXISTING Starfall/EarthChain signed test-wallet projection.
 * No parallel wallet, no signing, no minting, no client-award authority.
 * Starfall assets remain Starfall assets; ASCENSION may display approved crossover
 * cosmetics only while the existing short-lived ownership proof is valid.
 */
import {verifyView,starfallSkins} from '../starfall/commerce/browser-commerce.mjs';

const STORAGE_KEY='earthchain.starfall.hosted.v1';
const WALLET_KEY='earthchain.no-server.v1';
const CROSSOVER={
  'solar-lion':{id:'solar-lion-armor',label:'Solar Lion · Sunforged',accent:'#ffd078',glow:'#ffb13b'},
  'fire-horse':{id:'fire-horse-armor',label:'Fire Horse · Emberbound',accent:'#ff7869',glow:'#ff4c34'},
  'earth-steward':{id:'earth-steward-armor',label:'Earth Steward · Verdant',accent:'#7dffc5',glow:'#42d99b'},
  'starfall-celestial-crown':{id:'celestial-crown',label:'Celestial Crown · Legacy',accent:'#b8d9ff',glow:'#82baff'}
};

export async function verifiedAscensionCosmetics({
  storage=globalThis.localStorage,
  fetcher=globalThis.fetch?.bind(globalThis),
  now=Date.now()
}={}){
  if(!storage||typeof fetcher!=='function')return {state:'unavailable',cosmetics:[]};
  let saved,wallet;
  try{
    saved=JSON.parse(storage.getItem(STORAGE_KEY)||'null');
    wallet=JSON.parse(storage.getItem(WALLET_KEY)||'null');
  }catch{return {state:'unavailable',cosmetics:[]};}
  if(!saved?.envelope||!saved?.guard||!/^ec_[a-f0-9]{32}$/.test(wallet?.vault?.address||'')){
    return {state:'not_connected',cosmetics:[]};
  }
  try{
    const response=await fetcher('../starfall/commerce/hosted-config.json',{cache:'no-store'});
    if(!response?.ok)throw Error('config_unavailable');
    const config=await response.json();
    const view=await verifyView(saved.envelope,{pin:config.pin,guard:saved.guard,now});
    if(view.config.network!==config.pin.network)throw Error('wrong_network');
    const owned=await starfallSkins(view,wallet.vault.address);
    const cosmetics=owned.map(item=>CROSSOVER[item.skinId]).filter(Boolean);
    return {state:'verified',network:view.config.network,expiresAt:view.expiresAt,cosmetics};
  }catch{
    return {state:'unverified',cosmetics:[]};
  }
}

export function applyAscensionCosmetic(game,cosmetic){
  if(!game||!cosmetic||!Object.values(CROSSOVER).some(x=>x.id===cosmetic.id))return false;
  game.cosmetic={...cosmetic};
  return true;
}
