import { test as base, expect, Page } from '@playwright/test';
import { ProjectPage } from '../pages/project.page';
import { UserPage } from '../pages/user.page';
import { users } from './users';

type WorkerFixtures = {
  adminPage: Page;
};

type TestFixtures = {
  projectPage: ProjectPage;
  userPage: UserPage;
};

async function loginAsAdmin(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Email' }).fill(users.admin.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(users.admin.password);
  await page.getByRole('button', { name: /continue to workspace/i }).click();
  await page.waitForTimeout(1_000);
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /log out/i })).toBeVisible({ timeout: 15_000 });
}

async function ensureLoggedIn(page: Page) {
  const logoutButton = page.getByRole('button', { name: /log out/i });

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

  try {
    await expect(logoutButton).toBeVisible({ timeout: 10_000 });
  } catch {
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible({ timeout: 10_000 });
    await loginAsAdmin(page);
    await expect(logoutButton).toBeVisible({ timeout: 10_000 });
  }

  await expect(page).toHaveURL(/dashboard/);
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  adminPage: [async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: 'https://bugflow-seven.vercel.app'
    });
    const page = await context.newPage();

    await loginAsAdmin(page);
    await use(page);

    await context.close();
  }, { scope: 'worker' }],

  projectPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage);
    await use(new ProjectPage(adminPage));
  },

  userPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage);
    await use(new UserPage(adminPage));
  }
});

export { expect };
