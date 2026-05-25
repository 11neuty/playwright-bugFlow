import { Locator, Page, expect } from '@playwright/test';

export class ProjectPage {
  readonly newProjectButton: Locator;
  readonly modal: Locator;
  readonly projectInput: Locator;
  readonly createButton: Locator;
  readonly projectDropdown: Locator;
  readonly closeModalButton: Locator;

  constructor(private page: Page) {
    this.newProjectButton = this.page.getByRole('button', { name: /new project/i });
    this.modal = this.page.getByRole('heading', { name: /^create project$/i });
    this.projectInput = this.page.getByPlaceholder(/mobile app/i);
    this.createButton = this.page.getByRole('button', { name: /^create project$/i }).last();
    this.projectDropdown = this.page.locator('select').first();
    this.closeModalButton = this.page.getByRole('button', { name: /close|cancel/i }).first();
  }

  async openCreateProjectModal() {
    await this.closeCreateProjectModalIfOpen();
    await expect(this.newProjectButton).toBeVisible();
    await this.newProjectButton.click();
    await expect(this.modal).toBeVisible();
  }

  async createProject(name: string) {
    await this.openCreateProjectModal();
    await this.projectInput.fill(name);
    await this.createButton.click();
  }

  async createProjectRapid(name: string, attempts = 2) {
    await this.openCreateProjectModal();
    await this.projectInput.fill(name);
    for (let i = 0; i < attempts; i += 1) {
      await this.createButton.click();
    }
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

  async switchProject(name: string) {
    await expect(this.projectDropdown).toBeVisible();
    await this.projectDropdown.selectOption({ label: name });
  }

  async expectProjectSelected(name: string) {
    const selectedLabel = await this.projectDropdown.locator('option:checked').first().textContent();
    expect(selectedLabel?.trim()).toBe(name);
  }

  async expectValidationMessage(pattern: RegExp) {
    await expect(this.page.getByText(pattern)).toBeVisible();
  }

  async openDashboard() {
    await this.page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(this.newProjectButton).toBeVisible();
  }

  async closeCreateProjectModalIfOpen() {
    if (await this.modal.isVisible().catch(() => false)) {
      if (await this.closeModalButton.isVisible().catch(() => false)) {
        await this.closeModalButton.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      await expect(this.modal).toBeHidden();
    }
  }
}
