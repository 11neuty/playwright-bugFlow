import { expect, Locator, Page } from '@playwright/test';
import fs from 'node:fs';
import { UserRole, users } from '../fixtures/users';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly logoutButton: Locator;

  constructor(private page: Page) {
    this.emailInput = this.page.getByRole('textbox', { name: /email/i }).first();
    this.passwordInput = this.page.getByRole('textbox', { name: /password/i }).first();
    this.submitButton = this.page.getByRole('button', { name: /continue to workspace|sign in|login/i }).first();
    this.logoutButton = this.page.getByRole('button', { name: /log out/i });
  }

  async goto() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(async error => {
      if (!String(error).includes('ERR_ABORTED')) throw error;
      await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    });
    if (await this.logoutButton.isVisible().catch(() => false)) {
      return;
    }
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await expect(this.submitButton).toBeEnabled();

    const loginResponse = this.page.waitForResponse(
      response => response.url().includes('/api/v1/auth/login'),
      { timeout: 20_000 }
    ).catch(() => null);

    await this.submitButton.click();
    const response = await loginResponse;
    if (response?.ok()) {
      await expect(this.logoutButton).toBeVisible({ timeout: 20_000 });
    }
    return response?.status() ?? null;
  }

  async loginAs(role: UserRole) {
    if (await this.isLoggedInAs(role)) {
      return;
    }

    await this.restoreRoleFromStorage(role);
    if (await this.isLoggedInAs(role)) {
      return;
    }

    await this.goto();
    if (await this.isLoggedInAs(role)) {
      return;
    }
    await this.selectPresetRole(role);
    const status = await this.login(users[role].email, users[role].password);
    if (status && status >= 400) {
      await this.restoreRoleFromStorage(role);
    }
    await expect(this.logoutButton).toBeVisible({ timeout: 20_000 });
    await this.page.context().storageState({ path: roleStoragePath(role) });
  }

  async selectPresetRole(role: UserRole) {
    const preset = this.page.getByRole('button', {
      name: new RegExp(`${users[role].email}.*${escapeRegex(users[role].password)}`, 'i')
    });

    if (await preset.isVisible().catch(() => false)) {
      await preset.click();
    }
  }

  async expectInvalidLogin() {
    const errorBanner = this.page.getByText(/invalid|incorrect|wrong credentials|failed|unauthorized/i).first();
    if (await errorBanner.isVisible().catch(() => false)) {
      await expect(errorBanner).toBeVisible();
      return;
    }

    await expect(this.page).toHaveURL(/login/);
    await expect(this.emailInput).toBeVisible();
  }

  async expectLoggedIn(role?: UserRole) {
    await expect(this.logoutButton).toBeVisible();
    if (role) {
      await expect(this.page.getByText(users[role].email)).toBeVisible();
    }
  }

  async expectLoginPageVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  private async isLoggedInAs(role: UserRole) {
    const logoutVisible = await this.logoutButton.isVisible().catch(() => false);
    const userVisible = await this.page.getByText(users[role].email).isVisible().catch(() => false);
    return logoutVisible && userVisible;
  }

  private async restoreRoleFromStorage(role: UserRole) {
    const path = roleStoragePath(role);
    if (!fs.existsSync(path)) return;

    const state = JSON.parse(fs.readFileSync(path, 'utf-8')) as {
      cookies?: Parameters<ReturnType<Page['context']>['addCookies']>[0];
    };
    if (state.cookies?.length) {
      await this.page.evaluate(() => window.sessionStorage.clear()).catch(() => undefined);
      await this.page.context().addCookies(state.cookies);
      await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await this.logoutButton.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    }
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function roleStoragePath(role: UserRole) {
  return `storageState.${role}.json`;
}
