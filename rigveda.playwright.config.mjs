import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'rigveda.spec.js',reporter:'list',projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-webkit',use:{...devices['iPhone 13']}}]});
