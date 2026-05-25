import { test } from '../../fixtures/base.fixture';
import { generateIssueTitle, generateProjectName, generateUserEmail, generateUserName } from '../../utils/data.helper';

test.describe.skip('SMOKE | Core Business Flow', () => {
  test('TC-SMOKE-003 | project user issue and comment happy path', async ({
    projectPage,
    userPage,
    issuePage,
    commentPage,
    cleanup
  }) => {
    const project = generateProjectName();
    const userName = generateUserName();
    const userEmail = generateUserEmail();
    const issueTitle = generateIssueTitle();
    const comment = `SMOKE-COMMENT-${Date.now()}`;

    await test.step('Create project', async () => {
      await projectPage.openDashboard();
      await projectPage.createProject(project);
      cleanup.projects.add(project);
      await projectPage.verifyProjectCreated(project);
    });

    await test.step('Create user in project workspace', async () => {
      await userPage.openUsersPage();
      await userPage.createUser(userName, 'DEVELOPER', userEmail, 'Password123!');
      cleanup.users.add(userEmail);
      await userPage.verifyUserCreated();
    });

    await test.step('Create issue and assign user', async () => {
      await issuePage.openBoard();
      await issuePage.createIssue(issueTitle, 'Smoke flow issue');
      cleanup.issues.add(issueTitle);
      await issuePage.openIssueDetail(issueTitle);
      await issuePage.assignUser(userName);
      await issuePage.changePriority('HIGH');
    });

    await test.step('Add and verify comment', async () => {
      await commentPage.addComment(comment);
      await commentPage.expectCommentVisible(comment);
    });
  });
});
