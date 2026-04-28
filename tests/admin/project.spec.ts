import { test, expect } from '../../fixtures/base.fixture';

test.describe('Project Management - Admin', () => {

  test('TC-ADM-001 | create project success', async ({ projectPage }) => {
    const name = 'Project-' + Date.now();

    await projectPage.createProject(name);
    await projectPage.verifyProjectCreated(name);
  });

  test('TC-ADM-002 | empty name', async ({ projectPage }) => {
    await projectPage.createProjectWithoutName();
    await projectPage.verifyProjectNotCreated();
  });

});