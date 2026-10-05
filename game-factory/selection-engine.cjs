const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,".."),examples=path.join(__dirname,"examples"),batches=path.join(__dirname,"batches"),out=path.join(__dirname,"reports");
fs.mkdirSync(out,{recursive:true});
const rows=[];
for(const file of fs.readdirSync(examples).filter(x=>x.endsWith(".json")).sort()){
 const s=JSON.parse(fs.readFileSync(path.join(examples,file),"utf8")),game=path.join(root,"games",s.id,"index.html");
 const text=fs.existsSync(game)?fs.readFileSync(game,"utf8"):"";
 const checks={
  generated:!!text,
  telemetry:text.includes("beginRun")&&text.includes("finishRun")&&text.includes("event(run"),
  progression:text.includes("grantArtifact"),
  controls:/keydown|pointer/.test(text),
  completion:/end\("clear"/.test(text),
  retry:text.includes("location.reload"),
  arcadeReturn:text.includes('href="../../arcade/"')
 };
 const passed=Object.values(checks).filter(Boolean).length,total=Object.keys(checks).length;
 const score=Math.round(passed/total*100);
 rows.push({id:s.id,title:s.title,genre:s.genre,score,status:score===100?"promotion-ready":"hold",checks});
}
const report={schema:"portal.game-factory.selection.v1",generatedAt:new Date().toISOString(),policy:"Only structurally complete candidates may become promotion-ready; browser QA remains an independent release gate.",candidates:rows};
fs.writeFileSync(path.join(out,"selection.json"),JSON.stringify(report,null,2)+"\n");
console.log(rows.map(x=>x.id+" "+x.score+" "+x.status).join("\n"));
if(rows.some(x=>x.score<100))process.exitCode=1;
