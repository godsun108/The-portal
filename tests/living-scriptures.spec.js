import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
const local = name => pathToFileURL(resolve(process.cwd(), name)).href;

test('Landing page opens the Bible, ancient writings and comparison spaces', async ({page}) => {
  await page.goto(local('living-scriptures.html'));
  await expect(page.getByRole('heading',{name:/The Living/})).toBeVisible();
  await expect(page.getByRole('link',{name:/Enter the Bible reader/})).toHaveAttribute('href',/scripture-reader\.html/);
  await expect(page.getByRole('link',{name:/Explore 1 Enoch/})).toHaveAttribute('href',/1-enoch\.html/);
  await expect(page.getByText('38,058')).toBeVisible();
  await expect(page.getByRole('link',{name:/Open source comparison/})).toHaveAttribute('href',/scripture-compare\.html/);
});

test('Comparison source selectors retain distinct sources', async ({page}) => {
  await page.goto(local('scripture-compare.html'));
  await expect(page.locator('#linkA')).toHaveAttribute('href',/ebible.org/);
  await expect(page.locator('#linkB')).toHaveAttribute('href',/sefaria.org/);
  await page.locator('#b').selectOption('2');
  await expect(page.locator('#linkB')).toHaveAttribute('href',/codexsinaiticus.org/);
});

test('Reader exposes a usable local preview and correct source links', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await expect(page.locator('#chapter option')).toHaveCount(50);
  await page.locator('#book').selectOption('JHN');
  await expect(page.locator('#chapter option')).toHaveCount(21);
  await page.locator('#chapter').selectOption('3');
  await expect(page.locator('#source')).toHaveAttribute('href','https://ebible.org/eng-web/JHN03.htm');
  await page.getByRole('button',{name:'Read chapter'}).click();
  await expect(page.locator('#status')).toContainText('unavailable or could not be verified locally');
  await expect(page.locator('#verses')).toBeEmpty();
});

test('Reader safely renders source data without interpreting markup', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await page.evaluate(() => {
    window.fetch = async url => new Response(JSON.stringify({
      edition:'eng-web',book:'GEN',chapter:1,kind:'raw-usfm-review',
      verses:[{number:'1',raw_usfm:'In the beginning.'},{number:'2',raw_usfm:'<img src=x onerror=alert(1)> & text'}]
    }),{status:200,headers:{'Content-Type':'application/json'}});
  });
  await page.getByRole('button',{name:'Read chapter'}).click();
  await expect(page.locator('#verses .verse')).toHaveCount(2);
  await expect(page.locator('#verses img')).toHaveCount(0);
  await expect(page.locator('#verses')).toContainText('<img src=x onerror=alert(1)>');
});

test('Reader refuses mismatched chapter metadata', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await page.evaluate(() => {
    window.fetch = async () => new Response(JSON.stringify({
      edition:'eng-web',book:'JHN',chapter:1,kind:'raw-usfm-review',
      verses:[{number:'1',raw_usfm:'Wrong book'}]
    }),{status:200,headers:{'Content-Type':'application/json'}});
  });
  await page.getByRole('button',{name:'Read chapter'}).click();
  await expect(page.locator('#verses')).toBeEmpty();
  await expect(page.locator('#status')).toContainText('unavailable or could not be verified locally');
});

test('USFM projection keeps readable words and source notes inspectable', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await page.evaluate(() => {
    window.fetch = async () => new Response(JSON.stringify({
      edition:'eng-web',book:'GEN',chapter:1,kind:'raw-usfm-review',
      verses:[{number:'1',raw_usfm:'In the beginning.\\f + \\fr 1:1 \\ft A source note about the beginning.\\f*'}]
    }),{status:200,headers:{'Content-Type':'application/json'}});
  });
  await page.getByRole('button',{name:'Read chapter'}).click();
  await expect(page.locator('#verses .verse-text')).toContainText('In the beginning.');
  const disclosure=page.locator('#verses details').first();
  await expect(disclosure).toHaveCount(1);
  await disclosure.locator('summary').click();
  await expect(disclosure.locator('.source-notes')).toContainText('A source note about the beginning.');
  await expect(disclosure.locator('.source-notes')).not.toContainText('\\ft');
  await expect(disclosure.locator('pre')).toContainText('\\ft A source note');
});

test('Narrow phone viewport keeps reader controls accessible', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(local('scripture-reader.html'));
  await expect(page.getByRole('heading',{name:'Open the Scriptures.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Read chapter'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Save this book offline'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2)).toBe(false);
});

test('Reader labels, status and keyboard access remain clear', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await expect(page.getByLabel('Book',{exact:true})).toBeVisible();
  await expect(page.getByLabel('Chapter',{exact:true})).toBeVisible();
  await expect(page.locator('#status[role="status"][aria-live="polite"]')).toHaveCount(1);
  await page.getByLabel('Book',{exact:true}).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Chapter',{exact:true})).toBeFocused();
});

test('Reading appearance preferences persist safely', async ({page}) => {
  await page.goto(local('scripture-reader.html'));
  await expect(page.getByLabel('Reading text size')).toHaveValue('medium');
  await expect(page.getByLabel('Line spacing')).toHaveValue('comfortable');
  await page.getByLabel('Reading text size').selectOption('extra-large');
  await page.getByLabel('Line spacing').selectOption('compact');
  await expect(page.locator('html')).toHaveCSS('--scripture-size','29px');
  await expect(page.locator('html')).toHaveCSS('--scripture-leading','1.5');
  await page.reload();
  await expect(page.getByLabel('Reading text size')).toHaveValue('extra-large');
  await expect(page.getByLabel('Line spacing')).toHaveValue('compact');
});

test('1 Enoch reader exposes all 108 chapters and loads real source text', async ({page}) => {
  const chapter1=readFileSync(resolve(process.cwd(),'data/extra-scriptures/1-enoch/001.json'),'utf8');
  const chapter108=readFileSync(resolve(process.cwd(),'data/extra-scriptures/1-enoch/108.json'),'utf8');
  await page.addInitScript(({chapter1,chapter108})=>{
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async(input,init)=>{
      const url=String(input);
      if(url.includes('/data/extra-scriptures/1-enoch/')) return new Response(url.endsWith('/108.json')?chapter108:chapter1,{status:200,headers:{'Content-Type':'application/json'}});
      return nativeFetch(input,init);
    };
  },{chapter1,chapter108});
  await page.goto(local('1-enoch.html'));
  await expect(page.locator('#chapter option')).toHaveCount(108);
  await expect(page.locator('#text')).toContainText('The words of the blessing of Enoch');
  await page.locator('#chapter').selectOption('108');
  await expect(page.locator('#text')).toContainText('Another book which Enoch wrote');
});
