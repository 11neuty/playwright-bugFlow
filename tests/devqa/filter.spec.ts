import { test, expect } from '../../fixtures/base.fixture';
import { createIssueAPI, getDefaultProjectAPI } from '../../utils/api.helper';
import { generateIssueTitle } from '../../utils/data.helper';

test.describe('SEARCH AND FILTER | DevQA', () => {
  test('TC-DQ-005 | search issue by keyword and ID', async ({ loginAsRole, api, issuePage, cleanup }) => {
    const title = generateIssueTitle();

    await test.step('Seed searchable issue', async () => {
      const project = await getDefaultProjectAPI(api);
      const issue = await createIssueAPI(api, {
        title,
        description: 'Search by title and ID coverage',
        projectId: project!.id,
        priority: 'HIGH'
      });
      cleanup.issues.add(title);
      await loginAsRole('qa');
      await issuePage.openBoard();
      await issuePage.search(title);
      await issuePage.expectIssueVisible(title);
      await issuePage.search(issue!.issueKey);
      await issuePage.expectIssueVisible(title);
    });
  });

  test('TC-DQ-006 | filter by priority and clear filter', async ({ loginAsRole, issuePage, appPage }) => {
    await test.step('Open board as QA', async () => {
      await loginAsRole('qa');
      await issuePage.openBoard();
    });

    await test.step('Apply high priority filter', async () => {
      await issuePage.filterPriority('HIGH');
      await expect(appPage.getByRole('combobox', { name: /priority/i })).toHaveValue('HIGH');
    });

    await test.step('Clear priority filter', async () => {
      await issuePage.filterPriority('');
      await issuePage.clearSearch();
    });
  });

  test('TC-DQ-015 | search with no matching result shows empty board state', async ({ loginAsRole, issuePage }) => {
    await test.step('Search for a unique non-existing keyword', async () => {
      await loginAsRole('qa');
      await issuePage.openBoard();
      await issuePage.search(`NO-MATCH-${Date.now()}`);
    });

    await test.step('Verify empty result state is visible', async () => {
      await issuePage.expectEmptyState();
    });
  });

  test('TC-DQ-016 | search with special characters does not crash', async ({ loginAsRole, issuePage }) => {
    await test.step('Search using special characters', async () => {
      await loginAsRole('qa');
      await issuePage.openBoard();
      await issuePage.search('!@#$%');
    });

    await test.step('Verify board remains usable', async () => {
      await issuePage.expectEmptyState();
      await issuePage.clearSearch();
    });
  });
});
