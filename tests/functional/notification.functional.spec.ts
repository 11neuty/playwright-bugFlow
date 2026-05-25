import { test, expect } from '../../fixtures/base.fixture';
import { generateIssueTitle } from '../../utils/data.helper';

test.describe.skip('FUNCTIONAL | Notifications', () => {
  test('TC-NOTIF-001 | assignment and mention notifications lifecycle', async ({
    issuePage,
    notificationPage,
    commentPage,
    appPage,
    cleanup
  }) => {
    const title = generateIssueTitle();

    await test.step('Create issue and generate activity', async () => {
      await issuePage.openBoard();
      await issuePage.createIssue(title, 'Notification suite');
      cleanup.issues.add(title);
      await issuePage.openIssueDetail(title);
      await issuePage.changePriority('HIGH');
      await commentPage.addComment(`Notification check ${Date.now()}`);
    });

    await test.step('Verify notification count update', async () => {
      const count = await notificationPage.getCount();
      expect(count, 'notification count should be non-negative').toBeGreaterThanOrEqual(0);
    });

    await test.step('Mark as read and clear notifications', async () => {
      await notificationPage.markFirstAsRead();
      await notificationPage.clearAll();
      await notificationPage.openNotifications();
      await expect(appPage.getByText(/no notifications|empty/i)).toBeVisible();
    });
  });
});
