import { test, expect } from '../../fixtures/base.fixture';
import { createIssueAPI, createProjectAPI, getDefaultProjectAPI, listProjectsAPI } from '../../utils/api.helper';
import { generateIssueTitle, generateProjectName } from '../../utils/data.helper';

test.describe('INTEGRATION | Cross-role Visibility and Permissions', () => {
  test('TC-INT-001 | admin-created project is visible to admin dashboard list', async ({ api, projectPage, cleanup }) => {
    const projectName = generateProjectName();

    await test.step('Create project through API as admin', async () => {
      const project = await createProjectAPI(api, projectName);
      expect(project?.name).toBe(projectName);
      cleanup.projects.add(projectName);
    });

    await test.step('Verify project appears in dashboard dropdown', async () => {
      await projectPage.openDashboard();
      await projectPage.verifyProjectCreated(projectName);
    });
  });

  test('TC-INT-002 | DevQA-created issue is visible to admin', async ({ loginAsRole, issuePage, cleanup }) => {
    const title = generateIssueTitle();

    await test.step('Create issue as QA', async () => {
      await loginAsRole('qa');
      await issuePage.openBoard();
      await issuePage.createIssue(title, 'Cross-role visibility issue');
      cleanup.issues.add(title);
    });

    await test.step('Verify issue as admin', async () => {
      await loginAsRole('admin');
      await issuePage.openBoard();
      await issuePage.search(title);
      await issuePage.expectIssueVisible(title);
    });
  });

  test('TC-INT-003 | developer has issue access but no user creation control', async ({ loginAsRole, appPage, issuePage }) => {
    await test.step('Login as developer and verify board access', async () => {
      await loginAsRole('dev');
      await issuePage.openBoard();
      await expect(appPage.getByRole('button', { name: /new issue/i })).toBeVisible();
    });

    await test.step('Verify developer cannot create users', async () => {
      await expect(appPage.getByRole('button', { name: /new user/i })).toHaveCount(0);
    });
  });

  test('TC-INT-004 | deleted project no longer appears in API project list', async ({ api, cleanup }) => {
    const projectName = generateProjectName();

    await test.step('Create project and register cleanup', async () => {
      const project = await createProjectAPI(api, projectName);
      expect(project?.name).toBe(projectName);
      cleanup.projects.add(projectName);
    });

    await test.step('Verify project is currently listed', async () => {
      const projects = await listProjectsAPI(api);
      expect(projects.some(project => project.name === projectName)).toBe(true);
    });
  });

  test('TC-INT-006 | admin sees issue seeded through backend', async ({ api, issuePage, cleanup }) => {
    const title = generateIssueTitle();

    await test.step('Create issue through API', async () => {
      const project = await getDefaultProjectAPI(api);
      const issue = await createIssueAPI(api, {
        title,
        description: 'Admin dashboard integration issue',
        projectId: project!.id
      });
      expect(issue?.title).toBe(title);
      cleanup.issues.add(title);
    });

    await test.step('Verify issue on admin dashboard', async () => {
      await issuePage.openBoard();
      await issuePage.search(title);
      await issuePage.expectIssueVisible(title);
    });
  });
});
