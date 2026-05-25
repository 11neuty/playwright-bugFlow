import { APIRequestContext, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://bugflow-seven.vercel.app';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: string | null;
};

type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type Issue = {
  id: string;
  issueKey: string;
  title: string;
};

export async function getAccessToken(page: Page) {
  return page.evaluate(() => {
    const rawSession = window.sessionStorage.getItem('bugflow.session');
    if (!rawSession) return null;

    try {
      return JSON.parse(rawSession).accessToken as string;
    } catch {
      return null;
    }
  });
}

export async function createAuthenticatedRequestContext(
  playwright: { request: { newContext: (options: Record<string, unknown>) => Promise<APIRequestContext> } },
  page: Page
) {
  const token = await getAccessToken(page);
  if (!token) {
    throw new Error('BugFlow access token was not found in sessionStorage.');
  }

  return playwright.request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createProjectAPI(request: APIRequestContext, name: string) {
  const res = await request.post('/api/v1/projects', {
    data: { name },
    failOnStatusCode: false
  });
  return parseApiResponse<Project>(res, 'project');
}

export async function createUserAPI(
  request: APIRequestContext,
  payload: { name: string; email: string; password: string; role: 'ADMIN' | 'QA' | 'DEVELOPER' | 'VIEWER' }
) {
  const res = await request.post('/api/v1/users', {
    data: payload,
    failOnStatusCode: false
  });
  const body = await safeJson<ApiEnvelope<{ user: User }>>(res);
  return body?.data?.user ?? null;
}

export async function createIssueAPI(
  request: APIRequestContext,
  payload: {
    title: string;
    description: string;
    projectId: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assigneeId?: string;
  }
) {
  const res = await request.post('/api/v1/issues', {
    data: {
      priority: 'MEDIUM',
      severity: 'MEDIUM',
      ...payload
    },
    failOnStatusCode: false
  });
  const body = await safeJson<ApiEnvelope<{ issue: Issue }>>(res);
  return body?.data?.issue ?? null;
}

export async function getDefaultProjectAPI(request: APIRequestContext) {
  const projects = await listProjectsAPI(request);
  return projects.find(project => project.name === 'Default Project') ?? projects[0] ?? null;
}

export async function listProjectsAPI(request: APIRequestContext) {
  const res = await request.get('/api/v1/projects', { failOnStatusCode: false });
  const body = await safeJson<ApiEnvelope<Project[]>>(res);
  return body?.data ?? [];
}

export async function listUsersAPI(request: APIRequestContext) {
  const res = await request.get('/api/v1/users', { failOnStatusCode: false });
  const body = await safeJson<ApiEnvelope<{ users: User[] }>>(res);
  return body?.data?.users ?? [];
}

export async function listIssuesAPI(request: APIRequestContext, projectId?: string) {
  const query = projectId ? `?page=1&limit=100&projectId=${projectId}` : '?page=1&limit=100';
  const res = await request.get(`/api/v1/issues${query}`, { failOnStatusCode: false });
  const body = await safeJson<ApiEnvelope<{ issues: Issue[] }>>(res);
  return body?.data?.issues ?? [];
}

export async function deleteProjectAPI(request: APIRequestContext, name: string) {
  const projects = await listProjectsAPI(request);
  const target = projects.find(project => project.name === name);
  if (!target) return;

  await request.delete(`/api/v1/projects/${target.id}`, { failOnStatusCode: false });
}

export async function deleteUserAPI(request: APIRequestContext, email: string) {
  const users = await listUsersAPI(request);
  const target = users.find(user => user.email === email);
  if (!target) return;

  await request.delete(`/api/v1/users/${target.id}`, { failOnStatusCode: false });
}

export async function deleteIssueAPI(request: APIRequestContext, title: string) {
  const issues = await listIssuesAPI(request);
  const target = issues.find(issue => issue.title === title);
  if (!target) return;

  await request.delete(`/api/v1/issues/${target.id}`, { failOnStatusCode: false });
}

async function parseApiResponse<T>(res: Awaited<ReturnType<APIRequestContext['post']>>, key: string) {
  const body = await safeJson<ApiEnvelope<T | Record<string, T>>>(res);
  const data = body?.data;
  if (!data) return null;
  if (typeof data === 'object' && key in data) {
    return (data as Record<string, T>)[key];
  }
  return data as T;
}

async function safeJson<T>(res: Awaited<ReturnType<APIRequestContext['get']>>) {
  if (!res.ok()) return null;
  const contentType = res.headers()['content-type'];
  if (!contentType?.includes('application/json')) return null;
  return res.json() as Promise<T>;
}
