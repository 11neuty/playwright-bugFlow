import { expect, Locator, Page } from '@playwright/test';

export class IssuePage {
  readonly newIssueButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly createIssueButton: Locator;
  readonly searchInput: Locator;
  readonly priorityFilter: Locator;
  readonly statusFilter: Locator;
  readonly sortDropdown: Locator;

  constructor(private page: Page) {
    this.newIssueButton = this.page.getByRole('button', { name: /^new issue$/i });
    this.titleInput = this.page.getByPlaceholder(/login redirect loops/i);
    this.descriptionInput = this.page.getByPlaceholder(/what happened/i);
    this.createIssueButton = this.page.getByRole('button', { name: /^create issue$/i }).last();
    this.searchInput = this.page.getByPlaceholder(/search title/i);
    this.priorityFilter = this.page.locator('select').nth(1);
    this.statusFilter = this.page.locator('select').nth(2);
    this.sortDropdown = this.page.locator('select').nth(3);
  }

  async openBoard() {
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(this.newIssueButton).toBeVisible();
  }

  async openCreateIssueModal() {
    await this.openBoard();
    await this.newIssueButton.click();
    await expect(this.page.getByRole('heading', { name: /^create issue$/i })).toBeVisible();
  }

  async createIssue(title: string, description: string, options?: {
    assigneeLabel?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) {
    await this.openCreateIssueModal();
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);

    if (options?.assigneeLabel) {
      await this.page.locator('select').nth(4).selectOption({ label: options.assigneeLabel });
    }
    if (options?.priority) {
      await this.page.locator('select').nth(5).selectOption(options.priority);
    }
    if (options?.severity) {
      await this.page.locator('select').nth(6).selectOption(options.severity);
    }

    await this.createIssueButton.click();
    await this.expectIssueVisible(title);
  }

  async openIssue(title: string) {
    await this.expectIssueVisible(title);
    await this.page.getByText(title, { exact: true }).first().click();
    await expect(this.page).toHaveURL(/issues\//);
  }

  async openIssueDetail(title: string) {
    await this.openIssue(title);
  }

  async editIssue(title: string, updatedTitle: string) {
    await this.openIssue(title);
    const editableTitle = this.page.getByRole('textbox', { name: /title/i }).first();
    await expect(editableTitle).toBeVisible();
    await editableTitle.fill(updatedTitle);
    await this.page.getByRole('button', { name: /save|update/i }).first().click();
    await this.expectIssueVisible(updatedTitle);
  }

  async deleteIssue(title: string) {
    await this.openIssue(title);
    await this.page.getByRole('button', { name: /delete/i }).first().click();
    await this.page.getByRole('button', { name: /confirm|delete/i }).last().click();
    await this.expectIssueHidden(title);
  }

  async assignUser(assignee: string) {
    const assigneeDropdown = this.page.getByRole('combobox').filter({ hasText: new RegExp(assignee, 'i') }).first();
    await expect(assigneeDropdown).toBeVisible();
    await assigneeDropdown.selectOption({ label: assignee });
  }

  async changePriority(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    const priorityDropdown = this.page.getByRole('combobox').filter({ hasText: /low.*medium.*high/i }).first();
    await expect(priorityDropdown).toBeVisible();
    await priorityDropdown.selectOption(priority === 'CRITICAL' ? 'HIGH' : priority);
  }

  async changeStatus(status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE') {
    const statusDropdown = this.page.getByRole('combobox').filter({ hasText: /todo.*in progress.*done/i }).first();
    await expect(statusDropdown).toBeVisible();
    await statusDropdown.selectOption(status === 'BACKLOG' ? 'TODO' : status);
  }

  async expectIssueModalVisible() {
    await expect(this.page.getByText(/issue detail|handoff/i).first()).toBeVisible();
  }

  async expectIssueVisible(title: string) {
    await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
  }

  async expectIssueHidden(title: string) {
    await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
  }

  async search(term: string) {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(term);
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  async filterPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH' | '') {
    await this.priorityFilter.selectOption(priority);
  }

  async filterStatus(status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CLOSED' | 'REJECTED' | '') {
    await this.statusFilter.selectOption(status);
  }

  async sortBy(value: 'updatedAt:desc' | 'updatedAt:asc' | 'createdAt:desc' | 'createdAt:asc' | 'priority:desc' | 'priority:asc') {
    await this.sortDropdown.selectOption(value);
  }

  async expectEmptyState() {
    await expect(this.page.getByText(/nothing here yet|0 issues|no issues/i).first()).toBeVisible();
  }

  async expectCreateIssueUnavailable() {
    await expect(this.newIssueButton).toHaveCount(0);
  }
}
