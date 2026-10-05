const fs=require("fs"),path=require("path");
const dir=path.join(__dirname,"reports"),selection=path.join(dir,"selection.json");
if(!fs.existsSync(selection))throw Error("selection evidence missing");
const s=JSON.parse(fs.readFileSync(selection,"utf8")),ready=[],hold=[];
for(const c of s.candidates){
 const failed=Object.entries(c.checks).filter(([,v])=>!v).map(([k])=>k);
 const item={id:c.id,title:c.title,genre:c.genre,structuralScore:c.score,decision:c.status==="promotion-ready"?"browser-qa-required":"hold",failedChecks:failed,repair:failed.length?{mode:"bounded",allowed:failed.filter(x=>["retry","arcadeReturn"].includes(x)),manualReview:failed.filter(x=>!["retry","arcadeReturn"].includes(x))}:null};
 (c.status==="promotion-ready"?ready:hold).push(item);
}
const out={schema:"portal.game-factory.promotion.v1",generatedAt:new Date().toISOString(),policy:"Structural readiness never publishes a game by itself. Browser QA and release approval remain required.",readyForBrowserQA:ready,hold};
fs.writeFileSync(path.join(dir,"promotion.json"),JSON.stringify(out,null,2)+"\n");
console.log("Promotion gate:",ready.length,"ready for browser QA;",hold.length,"held");
