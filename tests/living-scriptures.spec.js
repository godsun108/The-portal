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
  await expect(page.locator('#status')).toContainText('unavailable or could not be verified locally');
  await expect(page.locator('#verses')).toBeEmpty();
});

test('Reader safely renders local chapter data without interpreting markup', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await page.evaluate(() => {
    const upstream = window.fetch.bind(window);
    window.fetch = async (url, options) => {
      const target=String(url);
      if (target.endsWith('/data/web-chapters/GEN/001.json')) return new Response(JSON.stringify({
        edition:'eng-web',book:'GEN',chapter:1,kind:'raw-usfm-review',
        verses:[{number:'1',raw_usfm:'In the beginning.'},{number:'2',raw_usfm:'<img src=x onerror=alert(1)> & text'}]
      }),{status:200,headers:{'Content-Type':'application/json'}});
      return upstream(url,options);
    };
  });
  await page.getByRole('button',{name:'Read chapter'}).click();
  await expect(page.locator('#verses .verse')).toHaveCount(2);
  await expect(page.locator('#verses img')).toHaveCount(0);
  await expect(page.locator('#verses')).toContainText('<img src=x onerror=alert(1)>');
});
test('Reader refuses mismatched chapter metadata',async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await page.evaluate(() => {
    window.fetch=async ()=>new Response(JSON.stringify({
      edition:'eng-web',book:'JHN',chapter:1,kind:'raw-usfm-review',
      verses:[{number:'1',raw_usfm:'Wrong book'}]
    }),{status:200,headers:{'Content-Type':'application/json'}});
  });
  await page.getByRole('button',{name:'Read chapter'}).click();
  await expect(page.locator('#verses')).toBeEmpty();
  await expect(page.locator('#status')).toContainText('unavailable or could not be verified locally');
});

test('Readable projection preserves words while retaining raw notes',async ({page})=>{
 await page.goto(local('scripture-reader.html'));
 await page.evaluate(()=>{
   window.fetch=async (url)=>new Response(JSON.stringify({
     edition:'eng-web',book:'GEN',chapter:1,kind:'raw-usfm-review',
     verses:[{number:'1',raw_usfm:'\\\\w In|strong="H1"\\\\w* \\\\w the|strong="H2"\\\\w* beginning.\\\\f + \\\\ft A source note\\\\f*'}]
   }),{status:200,headers:{'Content-Type':'application/json'}});
 });
 await page.getByRole('button',{name:'Read chapter'}).click();
 await expect(page.locator('#verses .verse span')).toContainText('In the beginning.');
 await expect(page.locator('#verses details')).toHaveCount(1);
 await expect(page.locator('#verses pre')).toContainText('A source note');
});
