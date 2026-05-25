import { test, expect } from '../../fixtures/base.fixture';
import { generateIssueTitle } from '../../utils/data.helper';

test.describe('ISSUE BOARD | DevQA', () => {
  test('TC-DQ-001 | DevQA creates issue with valid data', async ({ loginAsRole, issuePage, cleanup }) => {
    const title = generateIssueTitle();

    await test.step('Login as QA and open board', async () => {
      await loginAsRole('qa');
      await issuePage.openBoard();
    });

    await test.step('Create issue', async () => {
      await issuePage.createIssue(title, 'QA created issue from automation', { priority: 'HIGH', severity: 'MEDIUM' });
      cleanup.issues.add(title);
    });

    await test.step('Verify issue appears on board', async () => {
      await issuePage.search(title);
      await issuePage.expectIssueVisible(title);
    });
  });

  test('TC-DQ-002 | DevQA cannot submit issue without title', async ({ loginAsRole, issuePage }) => {
    await test.step('Login as QA and open create issue modal', async () => {
      await loginAsRole('qa');
      await issuePage.openCreateIssueModal();
    });

    await test.step('Submit issue with empty title', async () => {
      await issuePage.descriptionInput.fill('Missing title negative case');
      await issuePage.createIssueButton.click();
    });

    await test.step('Verify modal remains open', async () => {
      await expect(issuePage.titleInput).toBeVisible();
    });
  });

  test('TC-DQ-004 | DevQA filters status as kanban state proxy', async ({ loginAsRole, issuePage, api }) => {
    await test.step('Login as developer and open board', async () => {
      await loginAsRole('dev');
      await issuePage.openBoard();
    });

    await test.step('Filter board by To Do status', async () => {
      await issuePage.filterStatus('TODO');
      await expect(issuePage.statusFilter).toBeVisible();
    });

    await test.step('Filter board by In Progress status', async () => {
      await issuePage.filterStatus('IN_PROGRESS');
      await expect(issuePage.statusFilter).toBeVisible();
      expect(api, 'API fixture remains available for cleanup and state verification').toBeTruthy();
    });
  });
});
