import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 timeout:20000,
 use:{headless:true},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'mobile-webkit',use:{...devices['iPhone 13']}}
 ],
 reporter:'list',
});
