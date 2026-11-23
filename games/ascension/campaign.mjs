export const WORLDS=Object.freeze([
 {id:'gothic-bastion',name:'GOTHIC BASTION',story:'The first seals awaken beneath the old citadel.',boss:'THE WARDEN',bossAt:1050},
 {id:'ashen-expanse',name:'ASHEN EXPANSE',story:'A dead sun burns behind the ash storm.',boss:'CINDER COLOSSUS',bossAt:2250},
 {id:'foundry-orbit',name:'FOUNDRY ORBIT',story:'The foundry still forges things that should not live.',boss:'ORBITAL ENGINE',bossAt:3450},
 {id:'buried-spire',name:'THE BURIED SPIRE',story:'At the summit, the memory of the world waits.',boss:'THE LAST ARCHON',bossAt:4650}
]);
export function worldFor(height){const n=Math.max(0,Math.floor((Number(height)||0)/1200));return WORLDS[Math.min(WORLDS.length-1,n)];}
export function nextBoss(chapter){return WORLDS[chapter]||null;}
export function bossHealth(chapter){return 18+Math.max(0,chapter)*10;}
export function campaignComplete(chapter){return chapter>=WORLDS.length;}
