import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync('tv-channel-lab.html','utf8');
for(const id of ['region','country','category','query'])assert.match(html,new RegExp('id="'+id+'"'));
assert.match(html,/function refreshCountries\(/);
assert.match(html,/function regionFor\(/);
assert.match(html,/\(!region\|\|regionFor\(x\.country\)===region\)/);
assert.match(html,/\(!country\|\|String\(x\.country\|\|'Unknown'\)\.toUpperCase\(\)===country\)/);
assert.match(html,/rightsStatus:'unverified'/);
const scripts=html.split('<script>').slice(1).map(x=>x.split('</script>')[0]);
for(const [i,body] of scripts.entries()){try{new Function(body)}catch(e){throw new Error('Inline script '+i+' syntax: '+e.message)}}
assert.ok(scripts.length>0,'Expected at least one inline script');
console.log('World TV Channel Lab static smoke assertions passed');
