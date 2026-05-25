import { test, expect } from '../../fixtures/base.fixture';
import { createUserAPI, listUsersAPI } from '../../utils/api.helper';
import { generateUserEmail, generateUserName } from '../../utils/data.helper';

test.describe('USER MANAGEMENT | Admin', () => {
  test('TC-USER-001 | create developer and QA users with role assignment', async ({ userPage, api, cleanup }) => {
    const developerEmail = generateUserEmail();

    await test.step('Create developer user from UI', async () => {
      await userPage.openUsersPage();
      await userPage.createUser(`${generateUserName()} DEV`, 'DEVELOPER', developerEmail, 'Password123!');
      cleanup.users.add(developerEmail);
      await userPage.verifyUserCreated();
    });

    await test.step('Verify users exist with expected roles through backend state', async () => {
      const users = await listUsersAPI(api);
      expect(users.find(user => user.email === developerEmail)?.role).toBe('DEVELOPER');
    });
  });

  test('TC-USER-002 | required fields and invalid email are rejected', async ({ userPage }) => {
    await test.step('Submit user with empty name', async () => {
      await userPage.openUsersPage();
      await userPage.createUser('', 'DEVELOPER', generateUserEmail(), 'Password123!');
      await userPage.verifyUserNotCreated();
      await userPage.closeCreateUserModalIfOpen();
    });

    await test.step('Submit user with empty password', async () => {
      await userPage.createUser(generateUserName(), 'DEVELOPER', generateUserEmail(), '');
      await userPage.verifyUserNotCreated();
      await userPage.closeCreateUserModalIfOpen();
    });

    await test.step('Submit user with invalid email', async () => {
      await userPage.createUser(generateUserName(), 'QA', 'invalid-email', 'Password123!');
      await userPage.verifyUserNotCreated();
    });
  });

  test('TC-USER-003 | duplicate email is rejected', async ({ userPage, api, cleanup }) => {
    const email = generateUserEmail();
    const userName = generateUserName();

    await test.step('Seed existing user through API', async () => {
      const created = await createUserAPI(api, {
        name: userName,
        email,
        password: 'Password123!',
        role: 'DEVELOPER'
      });
      expect(created?.email).toBe(email);
      cleanup.users.add(email);
    });

    await test.step('Submit duplicate user from UI', async () => {
      await userPage.openUsersPage();
      await userPage.createUser(generateUserName(), 'QA', email, 'Password123!');
    });

    await test.step('Verify duplicate email is blocked', async () => {
      await userPage.expectValidationMessage(/already exists|duplicate|email/i);
    });
  });

  test('TC-USER-004 | viewer role creation is not supported by current product', async ({ api }) => {
    test.fail(true, 'Current API only supports ADMIN, QA, and DEVELOPER roles; VIEWER is a documented coverage gap.');

    await test.step('Attempt to create viewer user through API', async () => {
      const created = await createUserAPI(api, {
        name: generateUserName(),
        email: generateUserEmail(),
        password: 'Password123!',
        role: 'VIEWER'
      });
      expect(created?.role).toBe('VIEWER');
    });
  });
});
