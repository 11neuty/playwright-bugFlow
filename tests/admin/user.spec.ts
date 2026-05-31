import { test } from '../../fixtures/base.fixture';
import { UserPage } from '../../pages/user.page';

test.describe('User Management - Admin', () => {

  test('TC-ADM-003 | create user success', async ({ userPage }) => {
    await userPage.createUser(
      'Auto User',
      'DEVELOPER',
      `auto-${Date.now()}@mail.com`,
      'Password123!'
    );

    await userPage.verifyUserCreated();
  });

  test('TC-ADM-004 | Create user empty name', async ({ userPage }) => {
    await userPage.createUser(
      '',
      'DEVELOPER',
      `auto-${Date.now()}@mail.com`,
      'Password123!'
    );

    await userPage.verifyUserNotCreated();
  });


  test('TC-ADM-005 | Create user empty password', async ({ userPage }) => {
    await userPage.createUser(
      'AUTO USER',
      'DEVELOPER',
      'auto-${Date.now()}@mail.com',
      ''
    );
    await userPage.verifyUserNotCreated();
  })

  test('TC-ADM-006 | Delete user in Team Access', async({UserPage})=> {
    await UserPage}
  )
});