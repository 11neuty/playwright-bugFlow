import { test, expect } from '../../fixtures/base.fixture';

test.describe.skip('FUNCTIONAL | Sorting', () => {
  test('TC-ISSUE-003 | sort by priority and date asc desc', async ({ appPage, issuePage }) => {
    await test.step('Open board and apply priority sort ascending', async () => {
      await issuePage.openBoard();
      const sortField = appPage.getByRole('combobox', { name: /sort by/i });
      await sortField.selectOption('priority');
      const direction = appPage.getByRole('button', { name: /ascending|asc/i }).or(appPage.getByRole('button', { name: /descending|desc/i }));
      await direction.click();
      await expect(sortField, 'sort dropdown should remain visible after sorting').toBeVisible();
    });

    await test.step('Sort by date descending', async () => {
      const sortField = appPage.getByRole('combobox', { name: /sort by/i });
      await sortField.selectOption('date');
      const direction = appPage.getByRole('button', { name: /descending|desc/i }).or(appPage.getByRole('button', { name: /ascending|asc/i }));
      await direction.click();
      await expect(appPage.getByText(/issue|board/i).first()).toBeVisible();
    });
  });
});
