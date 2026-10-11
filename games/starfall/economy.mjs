export const catalog = Object.freeze([
 {id:'solar-lion',name:'Solar Lion',price:60,color:'#ffd078',description:'Gold hull • cosmetic'},
 {id:'fire-horse',name:'Fire Horse',price:90,color:'#ff7869',description:'Ember hull • cosmetic'},
 {id:'earth-steward',name:'Earth Steward',price:120,color:'#7dffc5',description:'Emerald hull • cosmetic'}
]);
export function fresh(){return {version:1,credits:0,cleared:false,owned:[],equipped:null};}
export function validate(s){if(!s||s.version!==1||!Number.isSafeInteger(s.credits)||s.credits<0||typeof s.cleared!=='boolean'||!Array.isArray(s.owned)||new Set(s.owned).size!==s.owned.length||s.owned.some(id=>!catalog.some(i=>i.id===id))||(s.equipped!==null&&!s.owned.includes(s.equipped)))throw Error('Invalid local save');return s;}
export function purchase(s,id){validate(s);const item=catalog.find(i=>i.id===id);if(!item)throw Error('Unknown item');if(!s.cleared)throw Error('Defeat the guardian to unlock the hangar');if(s.owned.includes(id))throw Error('Already owned');if(s.credits<item.price)throw Error('Not enough game credits');return {...s,credits:s.credits-item.price,owned:[...s.owned,id],equipped:id};}
export function equip(s,id){validate(s);if(!s.owned.includes(id))throw Error('Item is not owned');return {...s,equipped:id};}
export function reward(s,won){validate(s);return {...s,credits:s.credits+(won?60:10),cleared:s.cleared||won};}
export function earthchainPurchase(){throw Error('EarthChain NFT settlement is not available. No wallet transaction was created.');}
