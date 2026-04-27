import { Page, expect } from '@playwright/test';

export class ProjectPage {
  constructor(private page: Page) {}

  get newProjectButton() {
    return this.page.getByRole('button', { name: 'New project' });
  }

  get projectInput() {
    return this.page.getByPlaceholder('Example: Mobile App');
  }

  get createProjectButton() {
    return this.page.locator('button[type="submit"]', {
      hasText: 'Create project'
    });
  }

  get projectDropdown() {
    return this.page.getByRole('combobox', { name: 'Project' });
  }

  async openNewProjectModal() {
    await this.newProjectButton.click();
    await expect(this.projectInput).toBeVisible();
  }

  async createProject(name: string) {
    await this.openNewProjectModal();

    await this.projectInput.fill(name);

    await expect(this.createProjectButton).toBeVisible();
    await expect(this.createProjectButton).toBeEnabled();

    await this.createProjectButton.click();

    // ✅ tunggu dropdown update
    await expect(this.projectDropdown).toContainText(name);
  }

  async verifyProjectVisible(name: string) {
    await expect(this.projectDropdown).toContainText(name);
  }
}