import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const html=readFileSync(fileURLToPath(new URL('./earthwallet-demo.html',import.meta.url)),'utf8');
test('wallet demo includes accessible mobile viewport and semantic main',()=>{assert.match(html,/name="viewport"/);assert.match(html,/<main /);assert.match(html,/aria-label="EarthChain destinations"/)});
test('wallet page imports actual screen model',()=>{assert.match(html,/import \{buildWalletScreen,EARTHWALLET_NAV\} from '\.\/earthwallet-screen-model\.mjs'/)});
test('wallet explicitly blocks real purchases',()=>{assert.match(html,/DEMO · NO PAYMENTS/);assert.match(html,/Buy EC \(unavailable\)/);assert.match(html,/no EC is transferred/)});
test('wallet has user-triggered review and quote controls',()=>{assert.match(html,/id="reviewButton"/);assert.match(html,/id="rate"/);assert.match(html,/role="status"/)});
