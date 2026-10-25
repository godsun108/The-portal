import {test,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
test('Self-contained review shows actual source passages offline',async({page,context})=>{
 const url=pathToFileURL(resolve('dist/living-scriptures-review.html')).href;
 // Linux WebKit raises an internal error opening file:// with Playwright offline mode.
 // Local files have no remote dependencies; keep the explicit offline toggle in Chromium.
 if(test.info().project.name==='chromium')await context.setOffline(true);
 await page.goto(url);
 await expect(page.getByRole('heading',{name:/A living library/})).toBeVisible();
 await expect(page.locator('#passage option')).toHaveCount(3);
 await expect(page.locator('.verse').first()).toContainText('beginning');
 await page.locator('#passage').selectOption('1');
 await expect(page.locator('#heading')).toHaveText('Psalm 23');
 await expect(page.locator('.verse').first()).toContainText('Yahweh');
 await page.locator('#passage').selectOption('2');
 await expect(page.locator('#heading')).toHaveText('John 3');
 await expect(page.locator('.verse').first()).toContainText('Nicodemus');
 await expect(page.locator('#status')).toContainText('offline');
});

test('Offline iPhone review provides keyboard skip link and named passage region',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto(pathToFileURL(resolve('dist/living-scriptures-review.html')).href);
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to passage'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#heading')).toBeFocused();
 await expect(page.getByRole('region',{name:'Genesis 1'})).toHaveCount(1);
 await expect(page.locator('.verse sup').first()).toHaveAttribute('aria-label','Verse 1');
 await page.locator('#passage').selectOption('2');
 await expect(page.getByRole('region',{name:'John 3'})).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
});
