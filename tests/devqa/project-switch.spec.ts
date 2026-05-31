import { test } from '../../fixtures/base.fixture';

test.describe('PROJECT SWITCHING | DevQA', () => {
  test('TC-DQ-009 | DevQA switches between assigned projects', async ({ loginAsRole, projectPage }) => {
    await test.step('Login as QA and open dashboard', async () => {
      await loginAsRole('qa');
      await projectPage.openDashboard();
    });

    await test.step('Switch to Default Project', async () => {
      await projectPage.switchProject('Default Project');
      await projectPage.expectProjectSelected('Default Project');
    });

    await test.step('Switch to POS KASIR when available', async () => {
      const hasPosKasir = await projectPage.projectDropdown.getByText('POS KASIR').isVisible().catch(() => false);
      if (hasPosKasir) {
        await projectPage.switchProject('POS KASIR');
        await projectPage.expectProjectSelected('POS KASIR');
      }
    });
  });
});
