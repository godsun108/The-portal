const {test,expect}=require("@playwright/test");
const fs=require("fs"),path=require("path"),root=path.join(__dirname,"..","game-factory");
const specs=fs.readdirSync(path.join(root,"examples")).filter(x=>x.endsWith(".json")).map(x=>JSON.parse(fs.readFileSync(path.join(root,"examples",x),"utf8")));
for(const file of fs.readdirSync(path.join(root,"batches")).filter(x=>x.endsWith(".json"))){const b=JSON.parse(fs.readFileSync(path.join(root,"batches",file),"utf8"));if(Array.isArray(b.candidates))specs.push(...b.candidates)}
for(const s of specs){
 test("factory candidate "+s.id+" boots and starts",async({page})=>{
  const base=process.env.FACTORY_PREVIEW_URL;test.skip(!base,"FACTORY_PREVIEW_URL not configured");
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/games/"+s.id+"/",{waitUntil:"domcontentloaded"});
  await expect(page.locator("#start")).toBeVisible();
  await page.locator("#start").click();
  await expect(page.locator("#gate")).toHaveClass(/hidden/);
  await page.waitForTimeout(750);
  expect(errors).toEqual([]);
  await expect(page.locator("canvas")).toBeVisible();
  const box=await page.locator("canvas").boundingBox();expect(box&&box.width>0&&box.height>0).toBeTruthy();
 });
}
