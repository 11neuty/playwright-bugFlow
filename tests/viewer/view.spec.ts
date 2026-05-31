import { test, expect } from '../../fixtures/base.fixture';
import { users } from '../../fixtures/users';

test.describe('VIEWER | Read-only Access', () => {
  test('TC-VW-001 | configured viewer credential should access issue list', async ({ loginPage, navigationPage, appPage }) => {
    test.fail(true, 'Configured viewer credential is rejected by the current application.');

    await test.step('Attempt viewer login', async () => {
      await navigationPage.logoutIfVisible();
      await loginPage.goto();
      await loginPage.login(users.viewer.email, users.viewer.password);
    });

    await test.step('Verify read-only issue list is visible', async () => {
      await expect(loginPage.logoutButton).toBeVisible();
      await expect(appPage.getByText(/dashboard|todo|issue/i).first()).toBeVisible();
      await expect(appPage.getByRole('button', { name: /new issue/i })).toHaveCount(0);
    });
  });

  test('TC-VW-010 | viewer search is blocked until viewer role exists', async ({ loginPage, navigationPage, appPage }) => {
    test.fail(true, 'Viewer role is not available in login presets or user creation API.');

    await test.step('Login as viewer and search issue list', async () => {
      await navigationPage.logoutIfVisible();
      await loginPage.goto();
      await loginPage.login(users.viewer.email, users.viewer.password);
      await expect(loginPage.logoutButton).toBeVisible();
      await appPage.getByPlaceholder(/search title/i).fill('DF-');
      await expect(appPage.getByText(/DF-/i).first()).toBeVisible();
    });
  });
});
