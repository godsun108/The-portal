import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:8765/';
test('real Genesis chapter loads from staged corpus',async ({page})=>{
 await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('Local review corpus detected');
 await page.locator('#book').selectOption('GEN');
 await page.locator('#chapter').selectOption('1');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toContainText('beginning');
 await expect(page.locator('#status')).toContainText('Loaded');
});
test('saving Genesis enables offline chapter reading',async ({page,context})=>{
 test.setTimeout(60000);
 await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('Local review corpus detected');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.locator('#book').selectOption('GEN');
 await page.getByRole('button',{name:'Save this book offline'}).click();
 await expect(page.locator('#status')).toContainText('Saved 50 chapters',{timeout:30000});
 await context.setOffline(true);
 await page.locator('#chapter').selectOption('2');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toBeVisible();
 await expect(page.locator('#status')).toContainText('Loaded');
 await context.setOffline(false);
});

test('Next chapter navigation and last-read bookmark use real source',async ({page})=>{
 await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('Local review corpus detected');
 await page.locator('#book').selectOption('GEN');
 await page.locator('#chapter').selectOption('1');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toBeVisible();
 await page.getByRole('button',{name:'Next'}).click();
 await expect(page.locator('#heading')).toHaveText(/^(Genesis|GEN) 2$/);
 await expect(page.locator('#verses .verse').first()).toBeVisible();
 const last=await page.evaluate(()=>JSON.parse(localStorage.getItem('living-scriptures-last')));
 expect(last).toEqual({book:'GEN',chapter:2});
 await page.getByRole('button',{name:'Previous'}).click();
 await expect(page.locator('#heading')).toHaveText(/^(Genesis|GEN) 1$/);
});

test('Full corpus manifest supplies titled books and non-Genesis passages',async ({page})=>{
 await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('Local review corpus detected');
 await expect(page.locator('#book option')).toHaveCount(81);
 await page.locator('#book').selectOption('EXO');
 await page.locator('#chapter').selectOption('3');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toBeVisible();
 await expect(page.locator('#heading')).toHaveText(/^(Exodus|EXO) 3$/);
 // Both old and regenerated manifests are valid during the branch-only staging transition.
});

test('Resume returns to last read passage',async ({page})=>{
 await page.goto(BASE+'scripture-reader.html');
 await expect(page.locator('#status')).toContainText('Local review corpus detected');
 await page.locator('#book').selectOption('JHN');
 await page.locator('#chapter').selectOption('3');
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse').first()).toBeVisible();
 await page.reload();
 await expect(page.locator('#status')).toContainText('Local review corpus detected');
 await page.getByRole('button',{name:'Resume last reading'}).click();
 await expect(page.locator('#heading')).toHaveText(/^(John|JHN) 3$/);
 await expect(page.locator('#verses .verse').first()).toBeVisible();
});
