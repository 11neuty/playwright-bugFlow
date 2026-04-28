import { Locator, Page, expect } from '@playwright/test';

export class ProjectPage {
  readonly newProjectButton: Locator;
  readonly modal: Locator;
  readonly projectInput: Locator;
  readonly createButton: Locator;
  readonly projectDropdown: Locator;

  constructor(private page: Page) {
    this.newProjectButton = this.page.getByRole('button', { name: /new project/i });
    this.modal = this.page.getByRole('heading', { name: /^create project$/i });
    this.projectInput = this.page.getByPlaceholder(/mobile app/i);
    this.createButton = this.page.getByRole('button', { name: /^create project$/i }).last();
    this.projectDropdown = this.page.locator('select').first();
  }

  async openCreateProjectModal() {
    await expect(this.newProjectButton).toBeVisible();
    await this.newProjectButton.click();
    await expect(this.modal).toBeVisible();
  }

  async createProject(name: string) {
    await this.openCreateProjectModal();
    await this.projectInput.fill(name);
    await this.createButton.click();
  }

  async createProjectWithoutName() {
    await this.openCreateProjectModal();
    await this.createButton.click();
  }

  async verifyProjectCreated(name: string) {
    await expect(this.projectDropdown).toContainText(name);
  }

  async verifyProjectNotCreated() {
    await expect(this.modal).toBeVisible();
  }

  async verifyDuplicateError() {
    await expect(this.page.getByText(/already exists/i)).toBeVisible();
  }
}
