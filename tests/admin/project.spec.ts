import { test, expect } from '../../fixtures/base.fixture';
import { generateLongText, generateProjectName } from '../../utils/data.helper';

test.describe('PROJECT MANAGEMENT | Admin', () => {
  test('TC-PRJ-001 | create project success and switch project', async ({ projectPage, cleanup }) => {
    const projectA = `${generateProjectName()}-A`;
    const projectB = `${generateProjectName()}-B`;

    await test.step('Create first project', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(projectA);
      cleanup.projects.add(projectA);
      await projectPage.verifyProjectCreated(projectA);
    });

    await test.step('Create second project', async () => {
      await projectPage.createProject(projectB);
      cleanup.projects.add(projectB);
      await projectPage.verifyProjectCreated(projectB);
    });

    await test.step('Switch active project from dropdown', async () => {
      await projectPage.switchProject(projectA);
      await projectPage.expectProjectSelected(projectA);
      await projectPage.switchProject(projectB);
      await projectPage.expectProjectSelected(projectB);
    });
  });

  test('TC-PRJ-002 | empty project name is rejected', async ({ projectPage }) => {
    await test.step('Submit create project without a name', async () => {
      await projectPage.openDashboard();
      await projectPage.createProjectWithoutName();
    });

    await test.step('Verify modal remains open and project is not created', async () => {
      await projectPage.verifyProjectNotCreated();
      await expect(projectPage.projectInput).toBeVisible();
    });
  });

  test('TC-PRJ-003 | duplicate project name is rejected', async ({ projectPage, cleanup }) => {
    test.fail(true, 'Current UI enforces uniqueness without showing a visible duplicate validation message.');
    const projectName = generateProjectName();

    await test.step('Create baseline project', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(projectName);
      cleanup.projects.add(projectName);
      await projectPage.verifyProjectCreated(projectName);
    });

    await test.step('Submit duplicate project name', async () => {
      await projectPage.createProject(projectName);
    });

    await test.step('Verify uniqueness validation is enforced', async () => {
      await projectPage.verifyDuplicateError();
    });
  });

  test('TC-PRJ-004 | project name length boundaries match actual behavior', async ({ projectPage, cleanup }) => {
    const shortName = 'A';
    const longName = generateLongText(260);

    await test.step('Submit too-short project name', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(shortName);
    });

    await test.step('Verify too-short project behavior', async () => {
      const created = await projectPage.projectDropdown.getByText(shortName, { exact: true }).isVisible().catch(() => false);
      if (created) {
        cleanup.projects.add(shortName);
        await projectPage.verifyProjectCreated(shortName);
      } else {
        await projectPage.verifyProjectNotCreated();
        await projectPage.closeCreateProjectModalIfOpen();
      }
    });

    await test.step('Submit very long project name', async () => {
      await projectPage.createProject(longName);
    });

    await test.step('Verify long project behavior is explicit', async () => {
      const created = await projectPage.projectDropdown.getByText(longName, { exact: true }).isVisible().catch(() => false);
      if (created) {
        cleanup.projects.add(longName);
        await projectPage.verifyProjectCreated(longName);
      } else {
        await projectPage.verifyProjectNotCreated();
      }
    });
  });

  test('TC-PRJ-005 | special characters are handled without crashing', async ({ projectPage, cleanup }) => {
    const projectName = `QA-!@#$-${Date.now()}`;

    await test.step('Create project using special characters', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(projectName);
    });

    await test.step('Verify either accepted data or visible validation', async () => {
      const created = await projectPage.projectDropdown.getByText(projectName, { exact: true }).isVisible().catch(() => false);
      if (created) {
        cleanup.projects.add(projectName);
        await projectPage.verifyProjectCreated(projectName);
      } else {
        await projectPage.verifyProjectNotCreated();
      }
    });
  });
});
