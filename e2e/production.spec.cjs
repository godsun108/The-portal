const {test,expect}=require("@playwright/test");
const BASE=process.env.PORTAL_URL||"https://godsun108.github.io/The-portal";
for(const [id,text] of [["moon","DON'T TOUCH"],["button","DO NOT"],["life","READY?"]]){
 test("Arcade "+id+" renders visible native game",async({page})=>{
  await page.goto(BASE+"/arcade/?e2e="+Date.now(),{waitUntil:"networkidle"});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:"networkidle"});
  await page.locator('[data-g="'+id+'"]').click();
  await expect(page.locator("#stage")).toBeVisible();
  await expect(page.locator("#inside")).toContainText(text);
  const box=await page.locator("#inside").boundingBox(); expect(box&&box.width>0&&box.height>0).toBeTruthy();
 });
}
test("Earth serves observations and renderer",async({page})=>{
 await page.goto("https://godsun108.github.io/earth-now/?e2e="+Date.now(),{waitUntil:"domcontentloaded"});
 await expect(page.locator("#status")).toContainText(/\d+ OBSERVATIONS/,{timeout:30000});
});
test("Window opens a verified view or explicitly reports discovery",async({page})=>{
 await page.goto("https://godsun108.github.io/window-earth/?e2e="+Date.now(),{waitUntil:"domcontentloaded"});
 await expect.poll(async()=>await page.locator("#status").innerText(),{timeout:20000}).toMatch(/SOURCE|UNAVAILABLE/);
 const status=await page.locator("#status").innerText(); expect(status).not.toContain("VERIFYING VIEW");
});
