import { test, expect } from '../../fixtures/base.fixture';

test.describe.skip('FUNCTIONAL | Access Control', () => {
  test('TC-USER-003 | admin has full access', async ({ loginAsRole, navigationPage, appPage }) => {
    await test.step('Login as admin and verify protected actions are available', async () => {
      await loginAsRole('admin');
      await navigationPage.gotoDashboard();
      await expect(appPage.getByRole('button', { name: /new project/i })).toBeVisible();
      await navigationPage.gotoUsers();
      await expect(appPage.getByRole('button', { name: /new user/i })).toBeVisible();
    });
  });

  test('TC-USER-004 | qa, dev, viewer permission boundaries', async ({ loginAsRole, appPage }) => {
    await test.step('QA role should have limited management access', async () => {
      await loginAsRole('qa');
      await appPage.goto('/dashboard', { waitUntil: 'networkidle' });
      await expect(appPage.getByRole('button', { name: /new project/i })).toHaveCount(0);
    });

    await test.step('Developer role should have issue actions but not user management', async () => {
      await loginAsRole('dev');
      await appPage.goto('/board', { waitUntil: 'networkidle' });
      await expect(appPage.getByRole('button', { name: /new issue|create issue/i })).toBeVisible();
      await appPage.goto('/users', { waitUntil: 'domcontentloaded' });
      await expect(appPage.getByRole('button', { name: /new user/i })).toHaveCount(0);
    });

    await test.step('Viewer role should be read-only and blocked from unauthorized action', async () => {
      await loginAsRole('viewer');
      await appPage.goto('/board', { waitUntil: 'networkidle' });
      await expect(appPage.getByRole('button', { name: /new issue|create issue/i })).toHaveCount(0);
    });
  });
});
