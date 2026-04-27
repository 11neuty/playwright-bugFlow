import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { ProjectPage } from '../../pages/project.page';
import { users } from '../../fixtures/users';
import { generateProjectName } from '../../utils/data.helper';

test('TC-ADM-001 create project', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const projectPage = new ProjectPage(page);
  const projectName = generateProjectName();

  await loginPage.login(users.admin.email, users.admin.password);
  await loginPage.verifyLoginSuccess();

  await projectPage.createProject(projectName);
  await projectPage.verifyProjectVisible(projectName);
});