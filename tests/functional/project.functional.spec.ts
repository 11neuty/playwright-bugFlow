import { test } from '../../fixtures/base.fixture';
import { generateProjectName } from '../../utils/data.helper';

test.describe('FUNCTIONAL | Project', () => {
  test('TC-PRJ-001 | create project validations and duplicate', async ({ projectPage, cleanup }) => {
    const name = generateProjectName();

    await test.step('Create project success', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(name);
      cleanup.projects.add(name);
      await projectPage.verifyProjectCreated(name);
    });

    await test.step('Validate empty project name', async () => {
      await projectPage.createProjectWithoutName();
      await projectPage.verifyProjectNotCreated();
      await projectPage.closeCreateProjectModalIfOpen();
    });

    await test.step('Validate duplicate project', async () => {
      await projectPage.createProject(name);
      await projectPage.verifyDuplicateError();
      await projectPage.closeCreateProjectModalIfOpen();
    });
  });

  test('TC-PRJ-002 | switch project and dropdown state', async ({ projectPage, cleanup }) => {
    const nameA = `${generateProjectName()}-A`;
    const nameB = `${generateProjectName()}-B`;

    await test.step('Create two projects', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(nameA);
      await projectPage.createProject(nameB);
      cleanup.projects.add(nameA);
      cleanup.projects.add(nameB);
    });

    await test.step('Switch between projects from dropdown', async () => {
      await projectPage.switchProject(nameB);
      await projectPage.expectProjectSelected(nameB);
      await projectPage.switchProject(nameA);
      await projectPage.expectProjectSelected(nameA);
    });
  });
});
