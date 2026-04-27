import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
  baseURL: 'https://bugflow-seven.vercel.app',
  trace: 'on-first-retry',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
  browserName: 'chromium',
  headless: false,
},

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});