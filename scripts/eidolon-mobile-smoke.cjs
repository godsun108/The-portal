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
  await page.locator('#catalogload').click();
  await page.waitForFunction(()=>document.getElementById('catalogstatus')?.textContent.startsWith('Catalog:')||document.getElementById('catalogstatus')?.textContent.startsWith('Catalog unavailable:'),null,{timeout:30000});
  const catalogStatus=await page.locator('#catalogstatus').innerText();
  assert.match(catalogStatus,/^Catalog:/,'motion catalog must load');
  results.catalog=catalogStatus;
  check('catalog loaded');
  const catalog=JSON.parse(require('node:fs').readFileSync('eidolon-native-motion/motion-catalog.json','utf8'));
  assert.match(catalogStatus,new RegExp('Catalog: '+catalog.motions.length+' approved assets · '+catalog.motions.length+' playable clips'),'all approved motions must become playable clips');
  if(catalog.motions.length){
    const fs=require('node:fs');
    fs.mkdirSync('eidolon-motion-evidence',{recursive:true});
    results.motionEvidence=[];
    for(const entry of catalog.motions){
      const choices=await page.locator('#clipselect option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,text:n.textContent})));
      const choice=choices.find(c=>c.text.startsWith('Catalog: '+entry.title+' · '));
      assert.ok(choice,'approved clip missing: '+entry.id);
      await page.locator('#clipselect').selectOption(choice.value);
      await page.locator('#clipplay').click();
      await page.waitForTimeout(150);
      const firstFrame=await page.locator('#view').screenshot();
      await page.waitForTimeout(750);
      const secondFrame=await page.locator('#view').screenshot();
      assert.notDeepEqual(firstFrame,secondFrame,'clip has no visible animation between frames: '+entry.id);
      const screenshot='eidolon-motion-evidence/'+entry.id+'.png';
      await page.screenshot({path:screenshot,fullPage:true});
      const playbackStatus=await page.locator('#clipinfo').innerText();
      assert.ok(playbackStatus && !/error|failed|unavailable/i.test(playbackStatus),'clip playback failed: '+entry.id+' '+playbackStatus);
      results.motionEvidence.push({id:entry.id,screenshot,status:playbackStatus});
    }
    check('catalog motion visibly animates and screenshots captured');
  }
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
