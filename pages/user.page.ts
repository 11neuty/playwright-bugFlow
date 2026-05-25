import { Locator, Page, expect } from '@playwright/test';

export class UserPage {
  readonly newUserButton: Locator;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleDropdown: Locator;
  readonly createButton: Locator;
  readonly closeModalButton: Locator;

  constructor(private page: Page) {
    this.newUserButton = this.page.getByRole('button', { name: /new user/i });
    this.modal = this.page.getByRole('heading', { name: /^create user$/i });
    this.nameInput = this.page.getByPlaceholder(/example/i);
    this.emailInput = this.page.getByPlaceholder(/name@company.com/i);
    this.passwordInput = this.page.getByPlaceholder(/temporary password/i);
    this.roleDropdown = this.page.getByRole('combobox', { name: /role/i }).or(this.page.locator('select').last());
    this.createButton = this.page.getByRole('button', { name: /create user/i });
    this.closeModalButton = this.page.getByRole('button', { name: /cancel|close/i }).first();
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
    await this.selectRole(role);

    await this.createButton.click();
  }

  async createUserRapid(name: string, role: string, email: string, password: string, attempts = 2) {
    await this.openCreateUserModal();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.selectRole(role);
    for (let i = 0; i < attempts; i += 1) {
      await this.createButton.click();
    }
  }

  async verifyUserCreated() {
    await expect(this.modal).toBeHidden();
  }

  async verifyUserNotCreated() {
    await expect(this.modal).toBeVisible();
  }

  async closeCreateUserModalIfOpen() {
    if (await this.modal.isVisible().catch(() => false)) {
      await this.closeModalButton.click();
      await expect(this.modal).toBeHidden();
    }
  }

  async expectValidationMessage(pattern: RegExp) {
    await expect(this.page.getByText(pattern)).toBeVisible();
  }

  async searchUser(term: string) {
    const searchInput = this.page.getByRole('textbox', { name: /search/i }).or(this.page.getByPlaceholder(/search/i));
    await searchInput.fill(term);
  }

  async openUsersPage() {
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(this.newUserButton).toBeVisible();
  }

  private async selectRole(role: string) {
    const normalized = role.toLowerCase();
    const dropdown = this.roleDropdown.first();
    await expect(dropdown).toBeVisible();

    const options = await dropdown.locator('option').allTextContents();
    const matchedLabel = options.find(option => option.trim().toLowerCase().includes(normalized));

    if (matchedLabel) {
      await dropdown.selectOption({ label: matchedLabel.trim() });
      return;
    }

    await dropdown.selectOption(role);
  }
}
