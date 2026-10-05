const fs=require("fs"),path=require("path");
const dir=path.join(__dirname,"reports"),promotion=path.join(dir,"promotion.json");
if(!fs.existsSync(promotion))throw Error("promotion evidence missing");
const p=JSON.parse(fs.readFileSync(promotion,"utf8"));
const queue={schema:"portal.game-factory.release-queue.v1",generatedAt:new Date().toISOString(),policy:"Queue only. No automatic public release without browser evidence.",ready:p.readyForBrowserQA.map(x=>({id:x.id,title:x.title,genre:x.genre,next:"browser-qa"})),held:p.hold.map(x=>({id:x.id,title:x.title,genre:x.genre,failedChecks:x.failedChecks,next:"repair-or-review"}))};
fs.writeFileSync(path.join(dir,"release-queue.json"),JSON.stringify(queue,null,2)+"\n");
console.log("Release queue:",queue.ready.length,"ready,",queue.held.length,"held");
