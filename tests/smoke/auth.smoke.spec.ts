import { test, expect } from '../../fixtures/base.fixture';
import { users } from '../../fixtures/users';

test.describe('SMOKE | Auth', () => {
  test('TC-SMOKE-001 | login success and session persistence', async ({ adminPage, loginPage }) => {
    await test.step('Open login and authenticate', async () => {
      await loginPage.goto();
      await loginPage.login(users.admin.email, users.admin.password);
      await expect(adminPage.getByRole('button', { name: /log out/i }), 'logout button should be visible after login').toBeVisible();
    });

    await test.step('Refresh and verify session persists', async () => {
      await adminPage.reload();
      await expect(adminPage.getByRole('button', { name: /log out/i }), 'user should remain authenticated after refresh').toBeVisible();
    });
  });

  test('TC-SMOKE-002 | invalid credentials and retry', async ({ adminPage, loginPage, navigationPage }) => {
    await test.step('Logout active session', async () => {
      await navigationPage.logoutIfVisible();
    });

    await test.step('Submit invalid credentials and verify error', async () => {
      await loginPage.goto();
      await loginPage.login('invalid@mail.com', 'bad-password');
      await loginPage.expectInvalidLogin();
    });

    await test.step('Retry with valid credentials', async () => {
      await loginPage.login(users.admin.email, users.admin.password);
      await expect(adminPage.getByRole('button', { name: /log out/i }), 'user should recover by logging in with valid credentials').toBeVisible();
    });
  });
});
