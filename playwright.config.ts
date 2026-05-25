import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },

  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: process.env.BASE_URL ?? 'https://bugflow-seven.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  reporter: [['list'], ['html', { open: 'never' }]],

  projects: [
    {
      name: 'chromium',
      testIgnore: [
        /.*\.setup\.ts/,
        /.*[\\/]functional[\\/].*/,
        /.*[\\/]smoke[\\/].*/,
        /.*[\\/]extended[\\/].*/
      ],
      use: {
        browserName: 'chromium'
      }
    }
  ]
});
