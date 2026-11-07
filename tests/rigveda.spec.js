import {test,expect} from '@playwright/test';
test('Ten mandalas and reference-only hymn navigation',async({page})=>{
 await page.goto('http://127.0.0.1:8766/rigveda/');
 await expect(page.getByRole('heading',{name:/Ṛgveda/})).toBeVisible();
 await expect(page.locator('#mandala option')).toHaveCount(10);
 await page.locator('#mandala').selectOption('7');
 await page.locator('#sukta').fill('15');
 await expect(page.locator('#position')).toHaveText('RV 7.15');
 await expect(page.locator('#status')).toContainText('Reference only');
 await expect(page.locator('#english')).toContainText('not yet imported');
 await expect(page.locator('#sanskrit')).toContainText('not yet imported');
});
test('Only attributed external sources are displayed',async({page})=>{
 await page.goto('http://127.0.0.1:8766/rigveda/');
 await expect(page.locator('#sources .source')).toHaveCount(4);
 await expect(page.locator('#sources')).toContainText('GRETIL');
 await expect(page.locator('#sources')).toContainText('commercial use');
 for(const link of await page.locator('#sources a').all()){
  expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
  await expect(link).toHaveAttribute('rel','noopener noreferrer');
 }
});
test('Reject invalid hymn references',async({page})=>{
 await page.goto('http://127.0.0.1:8766/rigveda/');
 await page.locator('#sukta').fill('0');
 await expect(page.locator('#position')).toBeEmpty();
 await expect(page.locator('#status')).toContainText('valid positive hymn');
});
