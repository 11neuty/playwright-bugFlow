import { APIRequestContext, Page, test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import { CommentPage } from '../pages/comment.page';
import { BoardPage } from '../pages/board.page';
import { IssuePage } from '../pages/issue.page';
import { LoginPage } from '../pages/login.page';
import { NavigationPage } from '../pages/navigation.page';
import { NotificationPage } from '../pages/notification.page';
import { ProjectPage } from '../pages/project.page';
import { UserPage } from '../pages/user.page';
import { UserRole, users } from './users';
import {
  createAuthenticatedRequestContext,
  deleteIssueAPI,
  deleteProjectAPI,
  deleteUserAPI
} from '../utils/api.helper';

type WorkerFixtures = {
  adminPage: Page;
};

type TestFixtures = {
  appPage: Page;
  api: APIRequestContext;
  projectPage: ProjectPage;
  userPage: UserPage;
  issuePage: IssuePage;
  boardPage: BoardPage;
  commentPage: CommentPage;
  notificationPage: NotificationPage;
  navigationPage: NavigationPage;
  loginPage: LoginPage;
  loginAsRole: (role: UserRole) => Promise<void>;
  cleanup: {
    projects: Set<string>;
    users: Set<string>;
    issues: Set<string>;
  };
};

async function ensureLoggedIn(page: Page, role: UserRole = 'admin') {
  const loginPage = new LoginPage(page);

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  await loginPage.logoutButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
  const correctUserVisible = await page.getByText(users[role].email).isVisible().catch(() => false);
  if (await loginPage.logoutButton.isVisible().catch(() => false) && correctUserVisible) {
    return;
  }

  await new NavigationPage(page).logoutIfVisible();
  await loginPage.loginAs(role);
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  adminPage: [async ({ browser }, use) => {
    const storageState = fs.existsSync('storageState.admin.json')
      ? 'storageState.admin.json'
      : fs.existsSync('storageState.json')
        ? 'storageState.json'
        : undefined;
    const context = await browser.newContext({
      baseURL: process.env.BASE_URL ?? 'https://bugflow-seven.vercel.app',
      storageState
    });
    const page = await context.newPage();

    await ensureLoggedIn(page, 'admin');
    await context.storageState({ path: 'storageState.admin.json' });
    await use(page);

    await context.close();
  }, { scope: 'worker' }],

  cleanup: async ({}, use) => {
    await use({
      projects: new Set<string>(),
      users: new Set<string>(),
      issues: new Set<string>()
    });
  },

  api: async ({ adminPage, playwright }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    const requestContext = await createAuthenticatedRequestContext(playwright, adminPage);
    await use(requestContext);
    await requestContext.dispose();
  },

  appPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(adminPage);
  },

  projectPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new ProjectPage(adminPage));
  },

  userPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new UserPage(adminPage));
  },

  issuePage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new IssuePage(adminPage));
  },

  boardPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new BoardPage(adminPage));
  },

  commentPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new CommentPage(adminPage));
  },

  notificationPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new NotificationPage(adminPage));
  },

  navigationPage: async ({ adminPage }, use) => {
    await ensureLoggedIn(adminPage, 'admin');
    await use(new NavigationPage(adminPage));
  },

  loginPage: async ({ adminPage }, use) => {
    await use(new LoginPage(adminPage));
  },

  loginAsRole: async ({ adminPage }, use) => {
    await use(async (role: UserRole) => {
      await new LoginPage(adminPage).loginAs(role);
    });
  }
});

test.afterEach(async ({ adminPage }) => {
  for (const role of Object.keys(users) as UserRole[]) {
    if (await adminPage.getByText(users[role].email).isVisible().catch(() => false)) {
      await adminPage.context().storageState({ path: `storageState.${role}.json` });
    }
  }
});

test.afterEach(async ({ cleanup, api }) => {
  await cleanupArtifacts(api, cleanup);
});

async function cleanupArtifacts(
  request: APIRequestContext,
  cleanup: { projects: Set<string>; users: Set<string>; issues: Set<string> }
) {
  for (const title of cleanup.issues) {
    await deleteIssueAPI(request, title);
  }

  for (const email of cleanup.users) {
    await deleteUserAPI(request, email);
  }

  for (const name of cleanup.projects) {
    await deleteProjectAPI(request, name);
  }
}

export { expect };
