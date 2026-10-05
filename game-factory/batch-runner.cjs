const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.resolve(__dirname,".."),input=process.argv[2];if(!input)throw Error("usage: node game-factory/batch-runner.cjs <batch.json>");
const b=JSON.parse(fs.readFileSync(path.resolve(input),"utf8"));if(b.schema!=="portal.game-factory.batch.v1"||!Array.isArray(b.candidates))throw Error("invalid batch");
for(const s of b.candidates){const tmp=path.join("/tmp","portal-game-"+s.id+".json");fs.writeFileSync(tmp,JSON.stringify(s));cp.execFileSync(process.execPath,[path.join(__dirname,"game-factory.cjs"),tmp],{cwd:root,stdio:"inherit"});}
console.log("Batch complete:",b.batch,b.candidates.length,"candidates");
