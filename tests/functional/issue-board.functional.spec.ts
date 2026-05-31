import { test } from '../../fixtures/base.fixture';
import { generateIssueTitle } from '../../utils/data.helper';

test.describe.skip('FUNCTIONAL | Issue Board', () => {
  test('TC-ISSUE-001 | create edit status assign priority and delete issue', async ({ issuePage, userPage, cleanup }) => {
    const issueTitle = generateIssueTitle();
    const updatedIssueTitle = `${issueTitle}-UPDATED`;
    const assigneeEmail = `issue-${Date.now()}@mail.com`;
    const assigneeName = `Issue User ${Date.now()}`;

    await test.step('Create assignable user', async () => {
      await userPage.openUsersPage();
      await userPage.createUser(assigneeName, 'DEVELOPER', assigneeEmail, 'Password123!');
      cleanup.users.add(assigneeEmail);
      await userPage.verifyUserCreated();
    });

    await test.step('Create and edit issue', async () => {
      await issuePage.openBoard();
      await issuePage.createIssue(issueTitle, 'Issue functional flow');
      cleanup.issues.add(issueTitle);
      await issuePage.editIssue(issueTitle, updatedIssueTitle);
      cleanup.issues.delete(issueTitle);
      cleanup.issues.add(updatedIssueTitle);
    });

    await test.step('Update issue detail values', async () => {
      await issuePage.openIssueDetail(updatedIssueTitle);
      await issuePage.changeStatus('IN_PROGRESS');
      await issuePage.assignUser(assigneeName);
      await issuePage.changePriority('CRITICAL');
      await issuePage.expectIssueModalVisible();
    });

    await test.step('Delete issue', async () => {
      await issuePage.deleteIssue(updatedIssueTitle);
      cleanup.issues.delete(updatedIssueTitle);
    });
  });
});
