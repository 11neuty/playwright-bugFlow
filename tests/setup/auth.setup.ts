import { expect, test as setup } from '@playwright/test';
import { users } from '../../fixtures/users';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('textbox', { name: 'Email' }).fill(users.admin.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(users.admin.password);
  await Promise.all([
    page.waitForURL('**/dashboard'),
    page.getByRole('button', {
      name: /continue to workspace/i
    }).click()
  ]);
  await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();

  await page.context().storageState({
    path: 'storageState.json'
  });

  console.log('storageState ready');
});
