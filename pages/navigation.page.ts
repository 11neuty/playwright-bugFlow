import { expect, Page } from '@playwright/test';

export class NavigationPage {
  constructor(private page: Page) {}

  async gotoDashboard() {
    await this.page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async gotoUsers() {
    await this.page.goto('/users', { waitUntil: 'networkidle' });
  }

  async gotoBoard() {
    await this.page.goto('/board', { waitUntil: 'networkidle' });
  }

  async clickSidebarLink(name: RegExp) {
    await this.page.getByRole('navigation').getByRole('link', { name }).click();
  }

  async logoutIfVisible() {
    const logout = this.page.getByRole('button', { name: /log out/i });
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await expect(this.page.getByRole('textbox', { name: /email/i })).toBeVisible();
    }
  }
}
