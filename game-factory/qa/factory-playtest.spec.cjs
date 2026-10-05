const {test,expect}=require("@playwright/test");
const fs=require("fs"),path=require("path");
const dir=path.join(__dirname,"../examples");
const specs=fs.readdirSync(dir).filter(x=>x.endsWith(".json")).map(x=>JSON.parse(fs.readFileSync(path.join(dir,x),"utf8")));
for(const s of specs){
 test("factory candidate "+s.id+" boots and starts",async({page})=>{
  const base=process.env.FACTORY_PREVIEW_URL;
  test.skip(!base,"FACTORY_PREVIEW_URL not configured");
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/games/"+s.id+"/",{waitUntil:"domcontentloaded"});
  await expect(page.locator("#start")).toBeVisible();
  await page.locator("#start").click();
  await expect(page.locator("#gate")).toHaveClass(/hidden/);
  await page.waitForTimeout(750);
  expect(errors).toEqual([]);
  await expect(page.locator("canvas")).toBeVisible();
 });
}
