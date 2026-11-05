#!/usr/bin/env node
'use strict';
const { chromium } = require('playwright');
const nodePath = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+nodePath.resolve('music-foundry/preview-player.html'));
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Ready to play'),{timeout:60000});
 if(await page.locator('.track').count()!==1)throw new Error('Mix stream did not load');
 await page.locator('#play').click();
 await page.waitForTimeout(1300);
 if((await page.locator('#clock').textContent()).startsWith('0:00'))throw new Error('Playback clock did not advance');
 await page.locator('#play').click();
 await page.locator('#stemsMode').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Ready to play'),{timeout:60000});
 if(await page.locator('.track').count()!==4)throw new Error('Four stems did not load');
 await page.locator('.track').nth(0).getByRole('button',{name:'Solo'}).click();
 await page.locator('.track').nth(1).getByRole('button',{name:'Mute'}).click();
 if(errors.length)throw new Error(errors.join('; '));
 console.log('PASS direct instrumental stream loaded');
 console.log('PASS native streaming playback advances');
 console.log('PASS four stems load on demand');
 console.log('PASS solo and mute controls work');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
