import { Page, expect } from '@playwright/test';
import { users } from '../fixtures/users';

export class LoginPage {
  constructor(private page: Page) {}

  async loginAsAdmin() {
    await this.page.goto('/login');

    await this.page.getByRole('textbox', { name: 'Email' })
      .fill(users.admin.email);

    await this.page.getByRole('textbox', { name: 'Password' })
      .fill(users.admin.password);

    await Promise.all([
      this.page.waitForURL('**/dashboard'),
      this.page.getByRole('button', { name: /continue to workspace/i }).click()
    ]);

    await expect(this.page.locator('body')).toContainText('BugFlow');
  }
}
