import { expect, Locator, Page } from '@playwright/test';

export class CommentPage {
  readonly commentInput: Locator;
  readonly submitCommentButton: Locator;

  constructor(private page: Page) {
    this.commentInput = this.page.getByRole('textbox', { name: /comment/i }).or(this.page.getByPlaceholder(/add a comment/i));
    this.submitCommentButton = this.page.getByRole('button', { name: /add comment|post comment|submit/i });
  }

  async addComment(comment: string) {
    await this.commentInput.fill(comment);
    await this.submitCommentButton.click();
    await expect(this.page.getByText(comment)).toBeVisible();
  }

  async editComment(oldComment: string, newComment: string) {
    const row = this.page.getByText(oldComment).first();
    await row.hover();
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await this.commentInput.fill(newComment);
    await this.page.getByRole('button', { name: /save|update/i }).click();
    await expect(this.page.getByText(newComment)).toBeVisible();
  }

  async deleteComment(comment: string) {
    const row = this.page.getByText(comment).first();
    await row.hover();
    await this.page.getByRole('button', { name: /delete/i }).first().click();
    await expect(this.page.getByText(comment)).toHaveCount(0);
  }

  async expectValidation(pattern: RegExp) {
    await expect(this.page.getByText(pattern)).toBeVisible();
  }

  async expectCommentVisible(comment: string) {
    await expect(this.page.getByText(comment)).toBeVisible();
  }
}
