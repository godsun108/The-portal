const {test,expect}=require("@playwright/test");
test("EarthChain spatial bridge switches scenes and updates objects",async({page})=>{
  const base=process.env.FACTORY_PREVIEW_URL;
  test.skip(!base,"Preview server unavailable");
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/earthchain-spatial/",{waitUntil:"networkidle"});
  await expect(page.locator("#status")).toContainText("portal-xr · 2 objects");
  await page.getByRole("button",{name:"Reality Foundry sample"}).click();
  await expect(page.locator("#status")).toContainText("reality-foundry · 9 objects");
  const scene=page.locator("#scene");
  await expect(scene).toContainText("Mainspring barrel");
  await page.getByRole("button",{name:"Toggle visibility"}).click();
  await expect(scene).toContainText('"visible": false');
  await page.getByRole("button",{name:"Move selected object"}).click();
  await expect(scene).toContainText("0.1");
  expect(errors).toEqual([]);
});
