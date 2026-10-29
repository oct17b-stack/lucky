import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  // 账号表（user / session / account / verification）由 Better Auth 管理，这里不纳入迁移
  tablesFilter: ['!user', '!session', '!account', '!verification'],
});
