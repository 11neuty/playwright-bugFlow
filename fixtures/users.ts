export const users = {
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@bugtracker.dev',
    password: process.env.ADMIN_PASSWORD ?? 'Admin123!'
  },
  qa: {
    email: process.env.QA_EMAIL ?? 'qa@bugtracker.dev',
    password: process.env.QA_PASSWORD ?? 'Qa123456!'
  },
  dev: {
    email: process.env.DEV_EMAIL ?? 'dev@bugtracker.dev',
    password: process.env.DEV_PASSWORD ?? 'Dev123456!'
  },
  viewer: {
    email: process.env.VIEWER_EMAIL ?? 'viewer@mail.com',
    password: process.env.VIEWER_PASSWORD ?? 'password'
  }
};

export type UserRole = keyof typeof users;