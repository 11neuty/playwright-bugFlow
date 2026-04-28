import { test } from '../../fixtures/base.fixture';

test.describe('User Management - Admin', () => {

  test('TC-ADM-006 | create user success', async ({ userPage }) => {
    await userPage.createUser(
      'Auto User',
      'DEVELOPER',
      `auto-${Date.now()}@mail.com`,
      'Password123!'
    );

    await userPage.verifyUserCreated();
  });

  test('TC-ADM-007 | empty name', async ({ userPage }) => {
    await userPage.createUser(
      '',
      'DEVELOPER',
      `auto-${Date.now()}@mail.com`,
      'Password123!'
    );

    await userPage.verifyUserNotCreated();
  });

});