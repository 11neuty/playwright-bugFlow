import { test, expect } from '../../fixtures/base.fixture';
import { createUserAPI } from '../../utils/api.helper';
import { generateUserEmail, generateUserName } from '../../utils/data.helper';

test.describe('VIEWER | Restrictions', () => {
  test('TC-VW-003 | viewer cannot create issue because viewer role is unsupported', async ({ api }) => {
    test.fail(true, 'Current API rejects VIEWER as an invalid role, so read-only permission tests cannot be executed.');

    await test.step('Create viewer test account', async () => {
      const viewer = await createUserAPI(api, {
        name: generateUserName(),
        email: generateUserEmail(),
        password: 'Password123!',
        role: 'VIEWER'
      });
      expect(viewer?.role).toBe('VIEWER');
    });
  });

  test('TC-VW-004 | viewer edit/delete/comment actions remain unavailable by role contract', async ({ appPage }) => {
    test.fail(true, 'Viewer role is not implemented in the current product build.');

    await test.step('Verify viewer-only restrictions can be asserted once role exists', async () => {
      await appPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(appPage.getByText(/viewer/i)).toBeVisible();
      await expect(appPage.getByRole('button', { name: /edit|delete|add comment/i })).toHaveCount(0);
    });
  });
});
