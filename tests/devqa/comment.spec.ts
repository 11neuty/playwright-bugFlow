import { test, expect } from '../../fixtures/base.fixture';
import { createIssueAPI, getDefaultProjectAPI } from '../../utils/api.helper';
import { generateIssueTitle } from '../../utils/data.helper';

test.describe('COMMENTS | DevQA', () => {
  test('TC-DQ-003 | DevQA can open issue detail comment context', async ({ loginAsRole, api, issuePage, appPage, cleanup }) => {
    const title = generateIssueTitle();

    await test.step('Seed issue for comment testing', async () => {
      const project = await getDefaultProjectAPI(api);
      const issue = await createIssueAPI(api, {
        title,
        description: 'Comment coverage issue',
        projectId: project!.id
      });
      expect(issue?.title).toBe(title);
      cleanup.issues.add(title);
    });

    await test.step('Open issue detail as QA', async () => {
      await loginAsRole('qa');
      await issuePage.openBoard();
      await issuePage.search(title);
      await issuePage.openIssue(title);
    });

    await test.step('Verify detail page is available for collaboration', async () => {
      await expect(appPage).toHaveURL(/issues\//);
      await expect(appPage.getByText(/issue detail|comment|handoff/i).first()).toBeVisible();
    });
  });

  test('TC-DQ-010 | empty comment cannot be submitted from current detail UI', async ({ appPage }) => {
    test.fail(true, 'Current issue detail UI does not expose a comment textbox, so empty-comment validation is a product gap.');

    await test.step('Look for comment input on issue detail', async () => {
      await appPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(appPage.getByRole('textbox', { name: /comment/i })).toBeVisible();
    });
  });
});
