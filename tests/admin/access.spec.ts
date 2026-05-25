import { test, expect } from '../../fixtures/base.fixture';

test.describe('ACCESS CONTROL | Admin', () => {
  test('TC-ACL-001 | admin can access full management controls', async ({ loginAsRole, appPage }) => {
    await test.step('Login as admin', async () => {
      await loginAsRole('admin');
      await appPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(appPage.getByText('admin@bugtracker.dev')).toBeVisible();
    });

    await test.step('Verify project, user, and issue controls are visible', async () => {
      await expect(appPage.getByRole('button', { name: /new project/i })).toBeVisible();
      await expect(appPage.getByRole('button', { name: /new user/i })).toBeVisible();
      await expect(appPage.getByRole('button', { name: /new issue/i })).toBeVisible();
    });
  });

  test('TC-ACL-002 | admin can open team access area', async ({ loginAsRole, appPage }) => {
    await test.step('Login as admin and open dashboard', async () => {
      await loginAsRole('admin');
      await appPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Open Team Access and verify member management context appears', async () => {
      await appPage.getByRole('button', { name: /team access/i }).click();
      await expect(appPage.getByText(/team access|member|role/i).first()).toBeVisible();
    });
  });
});
