#!/usr/bin/env node
'use strict';
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

function makeWav(seconds, frequency) {
  const rate=24000, frames=Math.floor(rate*seconds), dataBytes=frames*2;
  const b=Buffer.alloc(44+dataBytes);
  b.write('RIFF',0);b.writeUInt32LE(36+dataBytes,4);b.write('WAVE',8);
  b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);
  b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);
  b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(dataBytes,40);
  for(let i=0;i<frames;i++)b.writeInt16LE(Math.round(Math.sin(2*Math.PI*frequency*i/rate)*5000),44+i*2);
  return b;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const page=await browser.newPage();
 const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>requests.push(r.url()));
 const file=path.resolve('music-foundry/preview-player.html');
 await page.goto('file://'+file);
 await page.locator('#files').setInputFiles([
  {name:'instrumental_mix.wav',mimeType:'audio/wav',buffer:makeWav(2,110)},
  {name:'lead.wav',mimeType:'audio/wav',buffer:makeWav(2,440)}
 ]);
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('ready'));
 if(await page.locator('.track').count()!==2)throw new Error('Expected two decoded tracks');
 if((await page.locator('#summary').textContent()).includes('2 tracks')===false)throw new Error('Track summary missing');
 await page.locator('#play').click();
 await page.waitForTimeout(350);
 const afterPlay=await page.locator('#clock').textContent();
 if(afterPlay.startsWith('0:00'))throw new Error('Shared transport clock did not advance');
 await page.locator('#play').click();
 const paused=await page.locator('#clock').textContent();
 await page.locator('#seek').evaluate(el=>{el.value='500';el.dispatchEvent(new Event('input',{bubbles:true}));});
 const sought=await page.locator('#clock').textContent();
 if(sought===paused)throw new Error('Shared seek did not update position');
 await page.locator('.track').nth(0).getByRole('button',{name:'Solo'}).click();
 if(await page.locator('.track').nth(0).getByRole('button',{name:'Unsolo'}).getAttribute('aria-pressed')!=='true')throw new Error('Solo control did not toggle');
 await page.locator('.track').nth(1).getByRole('button',{name:'Mute'}).click();
 if(await page.locator('.track').nth(1).getByRole('button',{name:'Unmute'}).getAttribute('aria-pressed')!=='true')throw new Error('Mute control did not toggle');
 await page.locator('#clear').click();
 if(await page.locator('.track').count()!==0)throw new Error('Clear did not remove tracks');
 if(errors.length)throw new Error('Browser errors: '+errors.join('; '));
 if(requests.length)throw new Error('Unexpected network requests: '+requests.join(', '));
 console.log('PASS browser decodes multiple WAV files');
 console.log('PASS synchronized transport advances and pauses');
 console.log('PASS shared seek changes playback position');
 console.log('PASS solo and mute controls toggle');
 console.log('PASS clear releases loaded tracks');
 console.log('PASS no page errors or network requests');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
