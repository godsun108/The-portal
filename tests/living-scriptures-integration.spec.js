import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:8765/';
test('real Genesis chapter loads from the staged corpus',async({page})=>{
 await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('81 books indexed');
 await page.locator('#book').selectOption('GEN');await page.locator('#chapter').selectOption('1');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toContainText('beginning');
 await expect(page.locator('#status')).toContainText('Chapter loaded');
});
test('saving a book enables offline reading and reader-shell reopen',async({page,context})=>{
 test.setTimeout(60000);await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('81 books indexed');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.locator('#book').selectOption('GEN');
 await page.getByRole('button',{name:'Save this book offline'}).click();
 await expect(page.locator('#status')).toContainText('Saved all 50 chapters',{timeout:30000});
 await context.setOffline(true);await page.locator('#chapter').selectOption('2');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toBeVisible();
 await expect(page.locator('#status')).toContainText('Chapter loaded');
 const cached=await page.evaluate(async()=>Promise.all(['./scripture-reader.html','./scripture-format.js','./data/web-chapters/manifest.json'].map(async x=>!!(await caches.match(new URL(x,location.href).href)))));
 expect(cached).toEqual([true,true,true]);
 if(test.info().project.name==='chromium'){
  await page.reload();await expect(page.locator('#status')).toContainText('81 books indexed');
  await page.locator('#book').selectOption('GEN');await page.locator('#chapter').selectOption('3');
  await page.getByRole('button',{name:'Read chapter'}).click();await expect(page.locator('#verses .verse').first()).toBeVisible();
 }
 await context.setOffline(false);
});
test('chapter navigation and resume bookmark work with the real corpus',async({page})=>{
 await page.goto(BASE+'scripture-reader.html');await expect(page.locator('#status')).toContainText('81 books indexed');
 await page.locator('#book').selectOption('GEN');await page.locator('#chapter').selectOption('1');
 await page.getByRole('button',{name:'Read chapter'}).click();await expect(page.locator('#verses .verse').first()).toBeVisible();
 await page.getByRole('button',{name:/Next/}).click();await expect(page.locator('#heading')).toHaveText('Genesis 2');
 const last=await page.evaluate(()=>JSON.parse(localStorage.getItem('living-scriptures-last-v2')));
 expect(last).toEqual({book:'GEN',chapter:2});
 await page.getByRole('button',{name:/Previous/}).click();await expect(page.locator('#heading')).toHaveText('Genesis 1');
});
test('manifest supplies 81 titled books and the reader opens non-Genesis passages',async({page})=>{
 await page.goto(BASE+'scripture-reader.html');await expect(page.locator('#status')).toContainText('81 books indexed');
 await expect(page.locator('#book option')).toHaveCount(81);
 await page.locator('#book').selectOption('EXO');await page.locator('#chapter').selectOption('3');
 await page.getByRole('button',{name:'Read chapter'}).click();await expect(page.locator('#verses .verse').first()).toBeVisible();
 await expect(page.locator('#heading')).toHaveText('Exodus 3');
});
test('resume returns to the last saved reading position',async({page})=>{
 await page.goto(BASE+'scripture-reader.html');await expect(page.locator('#status')).toContainText('81 books indexed');
 await page.locator('#book').selectOption('JHN');await page.locator('#chapter').selectOption('3');
 await page.getByRole('button',{name:'Read chapter'}).click();await expect(page.locator('#verses .verse').first()).toBeVisible();
 await page.reload();await expect(page.locator('#status')).toContainText('81 books indexed');
 await page.getByRole('button',{name:'Resume last reading'}).click();await expect(page.locator('#heading')).toHaveText('John 3');
});
test('Genesis, Psalms and John render readable source words',async({page})=>{
 await page.goto(BASE+'scripture-reader.html');await expect(page.locator('#status')).toContainText('81 books indexed');
 for(const [id,no] of [['GEN','1'],['PSA','23'],['JHN','3']]){
  await page.locator('#book').selectOption(id);await page.locator('#chapter').selectOption(no);
  await page.getByRole('button',{name:'Read chapter'}).click();await expect(page.locator('#verses .verse').first()).toBeVisible();
  const first=await page.locator('#verses .verse-text').first().innerText();
  expect(first).not.toContain('strong=');expect(first).not.toContain('\\w ');expect(first.trim().length).toBeGreaterThan(8);
 }
 await expect(page.locator('#source')).toHaveAttribute('href',/JHN03\.htm/);
});
