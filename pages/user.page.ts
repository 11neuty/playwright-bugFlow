import { Locator, Page, expect } from '@playwright/test';

export class UserPage {
  readonly newUserButton: Locator;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleDropdown: Locator;
  readonly createButton: Locator;

  constructor(private page: Page) {
    this.newUserButton = this.page.getByRole('button', { name: /new user/i });
    this.modal = this.page.getByRole('heading', { name: /^create user$/i });
    this.nameInput = this.page.getByPlaceholder(/example/i);
    this.emailInput = this.page.getByPlaceholder(/name@company.com/i);
    this.passwordInput = this.page.getByPlaceholder(/temporary password/i);
    this.roleDropdown = this.page.locator('select').nth(1);
    this.createButton = this.page.getByRole('button', { name: /create user/i });
  }

  async openCreateUserModal() {
    await expect(this.newUserButton).toBeVisible();
    await this.newUserButton.click();
    await expect(this.modal).toBeVisible();
  }

  async createUser(name: string, role: string, email: string, password: string) {
    await this.openCreateUserModal();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.roleDropdown.selectOption(role);

    await this.createButton.click();
  }

  async verifyUserCreated() {
    await expect(this.modal).toBeHidden();
  }

  async verifyUserNotCreated() {
    await expect(this.modal).toBeVisible();
  }
}
