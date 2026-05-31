import { test, expect } from '../../fixtures/base.fixture';

test.describe.skip('FUNCTIONAL | Navigation and Route Protection', () => {
  test('TC-SMOKE-004 | sidebar navigation and redirects', async ({ navigationPage, appPage }) => {
    await test.step('Navigate through sidebar links', async () => {
      await navigationPage.gotoDashboard();
      await navigationPage.clickSidebarLink(/dashboard/i);
      await expect(appPage).toHaveURL(/dashboard/);
      await navigationPage.clickSidebarLink(/board|issues/i);
      await expect(appPage).toHaveURL(/board|issue/);
    });

    await test.step('Verify route protection for unauthenticated state', async () => {
      await navigationPage.logoutIfVisible();
      await appPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(appPage).toHaveURL(/login/);
    });
  });
});
