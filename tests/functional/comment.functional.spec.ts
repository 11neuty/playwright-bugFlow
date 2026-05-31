import { test } from '../../fixtures/base.fixture';
import { generateCommentText, generateIssueTitle, generateLongText } from '../../utils/data.helper';

test.describe.skip('FUNCTIONAL | Comment System', () => {
  test('TC-CMT-001 | add edit delete and validation', async ({ issuePage, commentPage, cleanup }) => {
    const issueTitle = generateIssueTitle();
    const comment = generateCommentText();
    const updated = `${comment}-EDITED`;

    await test.step('Create issue and open detail', async () => {
      await issuePage.openBoard();
      await issuePage.createIssue(issueTitle, 'Comment feature coverage');
      cleanup.issues.add(issueTitle);
      await issuePage.openIssueDetail(issueTitle);
    });

    await test.step('Add, edit and delete comment', async () => {
      await commentPage.addComment(comment);
      await commentPage.editComment(comment, updated);
      await commentPage.deleteComment(updated);
    });

    await test.step('Validate empty and long comment', async () => {
      await commentPage.addComment('');
      await commentPage.expectValidation(/required|empty/i);
      await commentPage.addComment(generateLongText(500));
      await commentPage.expectCommentVisible(generateLongText(500));
    });
  });
});
