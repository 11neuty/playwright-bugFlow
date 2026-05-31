import { expect, Locator, Page } from '@playwright/test';

export class BoardPage {
  readonly todoColumn: Locator;
  readonly inProgressColumn: Locator;
  readonly doneColumn: Locator;
  readonly refreshButton: Locator;

  constructor(private page: Page) {
    this.todoColumn = this.page.getByText(/^Todo$/i).first();
    this.inProgressColumn = this.page.getByText(/^In progress$/i).first();
    this.doneColumn = this.page.getByText(/^Done$/i).first();
    this.refreshButton = this.page.getByRole('button', { name: /refresh/i });
  }

  async open() {
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(this.todoColumn).toBeVisible();
    await expect(this.inProgressColumn).toBeVisible();
    await expect(this.doneColumn).toBeVisible();
  }

  async refresh() {
    await expect(this.refreshButton).toBeVisible();
    await this.refreshButton.click();
    await expect(this.todoColumn).toBeVisible();
  }

  async expectIssueInBoard(title: string) {
    await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
  }
}
