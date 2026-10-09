#!/usr/bin/env node
// Automated EIDOLON mobile browser smoke test. Requires Playwright + Chromium in CI.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];
 const results={checks:[],errors,started:new Date().toISOString()};
 const check=(name)=>{results.checks.push(name);console.log('PASS',name)};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  await page.goto('http://127.0.0.1:8765/eidolon-native-motion/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.getElementById('build')?.textContent.includes('MODEL LOADED'),null,{timeout:90000});
  check('model loaded');
  assert.equal(await page.locator('#actionplay').count(),1);
  await page.locator('#actionpick').selectOption('walk');
  await page.locator('#actionplay').click();
  await page.waitForTimeout(700);
  assert.match(await page.locator('#actioninfo').innerText(),/Walk in place/);
  await page.locator('#actionpick').selectOption('dance:disco');
  await page.locator('#actionplay').click();
  await page.waitForTimeout(700);
  assert.match(await page.locator('#actioninfo').innerText(),/Disco/);
  await page.locator('#sequencepick').selectOption('demo');
  await page.locator('#sequenceplay').click();
  await page.waitForTimeout(700);
  assert.match(await page.locator('#actioninfo').innerText(),/Sequence running/);
  check('action switching');
  await page.locator('#sequencecancel').click();
  check('sequence start and cancel');
  await page.screenshot({path:'eidolon-mobile-smoke.png',fullPage:true});
  check('screenshot captured');
  assert.deepEqual(errors,[],'browser JS/console errors');
  console.log('PASS: model loaded, action switching, sequence start/cancel, no browser errors');
 }catch(e){
  results.failure=e.message;
  console.error('EIDOLON browser test failed:',e.message);
  console.error('Visible status:',await page.locator('#status').textContent().catch(()=>'<unavailable>'));
  await page.screenshot({path:'eidolon-mobile-smoke.png',fullPage:true,timeout:10000}).catch(()=>{});
  throw e;
 }finally{
  require('node:fs').writeFileSync('eidolon-mobile-results.json',JSON.stringify(results,null,2));
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
