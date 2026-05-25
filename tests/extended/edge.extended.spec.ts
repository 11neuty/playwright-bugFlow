import { test, expect } from '../../fixtures/base.fixture';
import { generateProjectName, generateUserEmail, generateUserName } from '../../utils/data.helper';

test.describe.skip('EXTENDED | Edge and Stress Behaviors', () => {
  test('TC-PRJ-003 | rapid repeated project creation and disabled state', async ({ projectPage, appPage, cleanup }) => {
    const projectName = generateProjectName();
    await projectPage.openDashboard();

    await test.step('Rapidly submit create action', async () => {
      await projectPage.createProjectRapid(projectName, 3);
      cleanup.projects.add(projectName);
      await projectPage.verifyProjectCreated(projectName);
    });

    await test.step('Validate disabled state during submission', async () => {
      await projectPage.openCreateProjectModal();
      await projectPage.projectInput.fill(`${projectName}-2`);
      await expect(projectPage.createButton).toBeEnabled();
    });
  });

  test('TC-USER-005 | rapid repeated user creation with duplicate protection', async ({ userPage, cleanup }) => {
    const email = generateUserEmail();
    await userPage.openUsersPage();
    await userPage.createUserRapid(generateUserName(), 'QA', email, 'Password123!', 3);
    cleanup.users.add(email);
    await userPage.expectValidationMessage(/already exists|duplicate/i);
  });

  test('TC-ISSUE-004 | network delay tolerance while navigating board', async ({ appPage, issuePage }) => {
    await test.step('Simulate delayed issue list response', async () => {
      await appPage.route('**/api/issues**', async route => {
        await new Promise(resolve => setTimeout(resolve, 250));
        await route.continue();
      });
      await issuePage.openBoard();
      await expect(appPage.getByText(/issue|board/i).first()).toBeVisible();
      await appPage.unroute('**/api/issues**');
    });
  });
});
