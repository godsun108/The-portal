const fs=require("fs"),path=require("path");
const root=__dirname,lib=JSON.parse(fs.readFileSync(path.join(root,"mechanics/library.json"),"utf8")),recipes=JSON.parse(fs.readFileSync(path.join(root,"recipes/recipes.json"),"utf8"));
const known=new Map(lib.mechanics.map(x=>[x.id,x])),errors=[];
for(const r of recipes.recipes){if(!r.id||!r.baseGenre||!Array.isArray(r.mechanics)||r.mechanics.length<2)errors.push((r.id||"recipe")+": malformed");for(const m of r.mechanics)if(!known.has(m))errors.push(r.id+": unknown mechanic "+m)}
if(errors.length)throw Error(errors.join("\n"));
const matrix=recipes.recipes.map(r=>({id:r.id,baseGenre:r.baseGenre,track:r.track||"volume",mechanicCount:r.mechanics.length,proven:r.mechanics.filter(m=>known.get(m).maturity==="proven").length,prototype:r.mechanics.filter(m=>known.get(m).maturity==="prototype").length,planned:r.mechanics.filter(m=>known.get(m).maturity==="planned").length,buildable:r.mechanics.every(m=>known.get(m).maturity!=="planned")}));
fs.mkdirSync(path.join(root,"reports"),{recursive:true});fs.writeFileSync(path.join(root,"reports/mechanic-matrix.json"),JSON.stringify({schema:"portal.game-factory.mechanic-matrix.v1",recipes:matrix},null,2)+"\n");
console.log("Mechanic recipes:",matrix.length,"buildable:",matrix.filter(x=>x.buildable).length);
