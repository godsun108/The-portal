import {test,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
test('Self-contained review shows actual source passages offline',async({page,context})=>{
 const url=pathToFileURL(resolve('dist/living-scriptures-review.html')).href;
 await context.setOffline(true);
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
