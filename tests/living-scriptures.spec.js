import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const local = (name) => pathToFileURL(resolve(process.cwd(), name)).href;

test('Sacred Library search filters catalog and opens details', async ({ page }) => {
  await page.goto(local('living-scriptures.html'));
  await expect(page.locator('#catalog article')).toHaveCount(9);
  await page.locator('#search').fill('Enoch');
  await expect(page.locator('#catalog article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Explore evidence' }).click();
  await expect(page.locator('#detailTitle')).toHaveText('1 Enoch');
  await expect(page.locator('#detailSource')).toHaveAttribute('href', /earlyjewishwritings/);
  await page.getByRole('button', { name: 'Close details' }).click();
  await expect(page.locator('#details')).toBeHidden();
});

test('Comparison source selectors retain distinct sources', async ({ page }) => {
  await page.goto(local('scripture-compare.html'));
  await expect(page.locator('#linkA')).toHaveAttribute('href', /ebible.org/);
  await expect(page.locator('#linkB')).toHaveAttribute('href', /sefaria.org/);
  await page.locator('#b').selectOption('2');
  await expect(page.locator('#linkB')).toHaveAttribute('href', /codexsinaiticus.org/);
});

test('Reader chapter selector and source fallback', async ({ page }) => {
  await page.goto(local('scripture-reader.html'));
  await expect(page.locator('#chapter option')).toHaveCount(50);
  await page.locator('#book').selectOption('JHN');
  await expect(page.locator('#chapter option')).toHaveCount(21);
  await page.locator('#chapter').selectOption('3');
  await expect(page.locator('#source')).toHaveAttribute('href', 'https://ebible.org/eng-web/JHN03.htm');
  await page.route('https://ebible.org/**', route => route.abort());
  await page.getByRole('button', { name: 'Read chapter' }).click();
  await expect(page.locator('#status')).toContainText('could not be safely displayed');
  await expect(page.locator('#verses')).toBeEmpty();
});
