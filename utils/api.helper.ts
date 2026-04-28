import { APIRequestContext } from '@playwright/test';

export async function deleteProjectAPI(
  request: APIRequestContext,
  name: string
) {
  const res = await request.get('/api/projects');

  if (!res.ok()) return;

  const type = res.headers()['content-type'];
  if (!type?.includes('application/json')) return;

  const data = await res.json();
  const target = data.find((p: any) => p.name === name);

  if (target) {
    await request.delete(`/api/projects/${target.id}`);
  }
}

export async function deleteUserAPI(
  request: APIRequestContext,
  email: string
) {
  const res = await request.get('/api/users');

  if (!res.ok()) return;

  const type = res.headers()['content-type'];
  if (!type?.includes('application/json')) return;

  const data = await res.json();
  const target = data.find((u: any) => u.email === email);

  if (target) {
    await request.delete(`/api/users/${target.id}`);
  }
}