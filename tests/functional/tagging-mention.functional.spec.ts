import { test } from '../../fixtures/base.fixture';
import { generateIssueTitle, generateUserEmail, generateUserName } from '../../utils/data.helper';

test.describe.skip('FUNCTIONAL | Tagging and Mention', () => {
  test('TC-CMT-002 | mention user and notification trigger', async ({
    issuePage,
    userPage,
    commentPage,
    notificationPage,
    cleanup
  }) => {
    const issueTitle = generateIssueTitle();
    const mentionName = generateUserName();
    const mentionEmail = generateUserEmail();
    const mentionComment = `@${mentionName} please review`;

    await test.step('Create mention target user', async () => {
      await userPage.openUsersPage();
      await userPage.createUser(mentionName, 'DEVELOPER', mentionEmail, 'Password123!');
      cleanup.users.add(mentionEmail);
      await userPage.verifyUserCreated();
    });

    await test.step('Create issue and mention user in comment', async () => {
      await issuePage.openBoard();
      await issuePage.createIssue(issueTitle, 'Mention flow');
      cleanup.issues.add(issueTitle);
      await issuePage.openIssueDetail(issueTitle);
      await commentPage.addComment(mentionComment);
      await commentPage.expectCommentVisible(mentionComment);
    });

    await test.step('Verify mention appears in notifications', async () => {
      await notificationPage.expectNotificationContains(mentionName);
    });
  });
});
