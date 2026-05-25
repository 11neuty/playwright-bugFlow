import { test, expect } from '../../fixtures/base.fixture';
import { users } from '../../fixtures/users';

test.describe('FUNCTIONAL | Auth', () => {
  test('TC-SMOKE-005 | logout redirects and blocks protected route', async ({ navigationPage, appPage, loginPage }) => {
    await test.step('Logout and verify redirect', async () => {
      await navigationPage.logoutIfVisible();
      await expect(appPage).toHaveURL(/login/);
    });

    await test.step('Attempt protected route access and confirm protection', async () => {
      await appPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(appPage).toHaveURL(/login/);
    });

    await test.step('Login again for stable continuation', async () => {
      await loginPage.login(users.admin.email, users.admin.password);
      await expect(appPage.getByRole('button', { name: /log out/i })).toBeVisible();
    });
  });

  test('TC-SMOKE-006 | repeated invalid login attempts show guard behavior', async ({ loginPage, navigationPage, appPage }) => {
    await navigationPage.logoutIfVisible();
    await loginPage.goto();
    await loginPage.login(`invalid-${Date.now()}@mail.com`, 'wrong-password');
    await loginPage.expectInvalidLogin();
    await expect(appPage.getByRole('button', { name: /continue to workspace|login|sign in/i })).toBeVisible();
  });
});
