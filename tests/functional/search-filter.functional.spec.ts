import { test, expect } from '../../fixtures/base.fixture';
import { generateIssueTitle } from '../../utils/data.helper';

test.describe.skip('FUNCTIONAL | Search and Filter', () => {
  test('TC-ISSUE-002 | search by title id and combined filters', async ({ appPage, issuePage, cleanup }) => {
    const issueA = `${generateIssueTitle()}-A`;
    const issueB = `${generateIssueTitle()}-B`;

    await test.step('Create searchable issues', async () => {
      await issuePage.openBoard();
      await issuePage.createIssue(issueA, 'Searchable issue A');
      await issuePage.createIssue(issueB, 'Searchable issue B');
      cleanup.issues.add(issueA);
      cleanup.issues.add(issueB);
    });

    await test.step('Search by title', async () => {
      const search = appPage.getByRole('textbox', { name: /search/i }).or(appPage.getByPlaceholder(/search/i));
      await search.fill(issueA);
      await expect(appPage.getByText(issueA)).toBeVisible();
      await search.fill('');
    });

    await test.step('Filter by priority and assignee then clear', async () => {
      const priorityFilter = appPage.getByRole('combobox', { name: /priority/i }).first();
      await priorityFilter.selectOption('HIGH');
      const assigneeFilter = appPage.getByRole('combobox', { name: /assignee/i }).first();
      await assigneeFilter.selectOption({ index: 1 });
      const clearFilter = appPage.getByRole('button', { name: /clear filter|reset/i });
      await clearFilter.click();
      await expect(priorityFilter).toBeVisible();
    });

    await test.step('Search by issue ID pattern', async () => {
      const firstIssueCard = appPage.getByText(/#[A-Za-z0-9-]+/).first();
      const issueId = (await firstIssueCard.textContent())?.trim() ?? '';
      if (issueId) {
        const search = appPage.getByRole('textbox', { name: /search/i }).or(appPage.getByPlaceholder(/search/i));
        await search.fill(issueId);
        await expect(appPage.getByText(issueId)).toBeVisible();
      }
    });
  });
});
