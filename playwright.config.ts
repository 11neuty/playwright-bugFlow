import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,
  workers: 1,

  use: {
    baseURL: 'https://bugflow-seven.vercel.app'
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      use: {
        browserName: 'chromium'
      }
    }
  ]
});
