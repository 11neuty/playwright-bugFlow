import { test } from '../../fixtures/base.fixture';
import { generateUserEmail, generateUserName } from '../../utils/data.helper';

test.describe.skip('FUNCTIONAL | User', () => {
  test('TC-USER-001 | create user with role assignment', async ({ userPage, cleanup }) => {
    const email = generateUserEmail();
    await test.step('Create developer user', async () => {
      await userPage.openUsersPage();
      await userPage.createUser(generateUserName(), 'DEVELOPER', email, 'Password123!');
      cleanup.users.add(email);
      await userPage.verifyUserCreated();
    });
  });

  test('TC-USER-002 | user validation and duplicate email', async ({ userPage, cleanup }) => {
    const email = generateUserEmail();
    const name = generateUserName();
    await userPage.openUsersPage();

    await test.step('Create baseline user', async () => {
      await userPage.createUser(name, 'QA', email, 'Password123!');
      cleanup.users.add(email);
      await userPage.verifyUserCreated();
    });

    await test.step('Validate empty name', async () => {
      await userPage.createUser('', 'QA', generateUserEmail(), 'Password123!');
      await userPage.verifyUserNotCreated();
    });

    await test.step('Validate invalid email and duplicate', async () => {
      await userPage.createUser(generateUserName(), 'QA', 'invalid-mail', 'Password123!');
      await userPage.expectValidationMessage(/invalid email|email format/i);
      await userPage.createUser(generateUserName(), 'DEVELOPER', email, 'Password123!');
      await userPage.expectValidationMessage(/already exists|duplicate/i);
    });
  });
});
