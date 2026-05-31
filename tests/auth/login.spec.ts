import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { NavigationPage } from '../../pages/navigation.page';
import { users } from '../../fixtures/users';

test.describe('AUTH | Login, Session, and Logout', () => {
  test('TC-AUTH-001 | login success', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open login page', async () => {
      await loginPage.goto();
    });

    await test.step('Submit valid admin credentials', async () => {
      await loginPage.login(users.admin.email, users.admin.password);
      await loginPage.expectLoggedIn('admin');
    });
  });

  test('TC-AUTH-002 | invalid login keeps user unauthenticated', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Submit invalid credentials', async () => {
      await loginPage.goto();
      await loginPage.login(`invalid-${Date.now()}@mail.com`, 'wrong-password');
    });

    await test.step('Verify user remains on login page with an error state', async () => {
      await loginPage.expectInvalidLogin();
      await expect(page.getByRole('button', { name: /log out/i })).toHaveCount(0);
    });
  });

  test('TC-AUTH-003 | session persists after refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Login as admin', async () => {
      await loginPage.loginAs('admin');
      await loginPage.expectLoggedIn('admin');
    });

    await test.step('Refresh and confirm protected UI remains available', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await loginPage.expectLoggedIn('admin');
      await expect(page).toHaveURL(/dashboard/);
    });
  });

  test('TC-AUTH-004 | logout redirects to login and protects dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const navigationPage = new NavigationPage(page);

    await test.step('Login then logout', async () => {
      await loginPage.loginAs('admin');
      await navigationPage.logoutIfVisible();
      await loginPage.expectLoginPageVisible();
    });

    await test.step('Open protected dashboard directly', async () => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/login/);
      await loginPage.expectLoginPageVisible();
    });
  });
});
