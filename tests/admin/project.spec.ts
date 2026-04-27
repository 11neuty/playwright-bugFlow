import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { ProjectPage } from '../../pages/project.page';
import { users } from '../../fixtures/users';
import { generateProjectName } from '../../utils/data.helper';

test('TC-ADM-001 create project', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const projectPage = new ProjectPage(page);
  const projectName = generateProjectName();

  await test.step('Login as admin', async () => {
    await loginPage.login(users.admin.email, users.admin.password);
    await loginPage.verifyLoginSuccess();
  });

  await test.step('Create project', async () => {
    await projectPage.createProject(projectName);
  });

  await test.step('Verify project created', async () => {
    const dropdown = page.getByRole('combobox', { name: 'Project' });

    // ✅ validasi project muncul dan terpilih
    await expect(dropdown).toContainText(projectName);

    // optional tambahan dari POM
    await projectPage.verifyProjectVisible(projectName);
  });
});