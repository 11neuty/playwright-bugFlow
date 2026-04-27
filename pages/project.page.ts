import { Page, expect } from '@playwright/test';

export class ProjectPage {
  constructor(private page: Page) {}

  async createProject(name: string) {
    await this.page.getByRole('button', { name: 'New project' }).click();

    const input = this.page.getByPlaceholder('Example: Mobile App');
    await expect(input).toBeVisible();
    await input.fill(name);

    const createBtn = this.page.locator('button[type="submit"]', {
      hasText: 'Create project'
    });

    await expect(createBtn).toBeVisible();
    await expect(createBtn).toBeEnabled();

    await createBtn.click();
  }

  async verifyProjectVisible(name: string) {
    const projectDropdown = this.page.getByRole('combobox', { name: 'Project' });

    await expect(projectDropdown).toContainText(name);
  }
}