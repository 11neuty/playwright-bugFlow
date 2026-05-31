import { expect, Locator, Page } from '@playwright/test';

export class NotificationPage {
  readonly bellButton: Locator;
  readonly panel: Locator;

  constructor(private page: Page) {
    this.bellButton = this.page.getByRole('button', { name: /notification|bell/i });
    this.panel = this.page.getByRole('region', { name: /notification/i }).or(this.page.getByRole('dialog', { name: /notification/i }));
  }

  async openNotifications() {
    await this.bellButton.click();
    await expect(this.panel).toBeVisible();
  }

  async expectNotificationContains(text: string) {
    await this.openNotifications();
    await expect(this.page.getByText(text, { exact: false })).toBeVisible();
  }

  async markFirstAsRead() {
    await this.openNotifications();
    await this.page.getByRole('button', { name: /mark as read/i }).first().click();
  }

  async clearAll() {
    await this.openNotifications();
    await this.page.getByRole('button', { name: /clear/i }).first().click();
  }

  async getCount() {
    const badge = this.bellButton.locator('span').first();
    const text = (await badge.textContent())?.trim() ?? '0';
    const value = Number(text);
    return Number.isNaN(value) ? 0 : value;
  }
}
