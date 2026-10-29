/**
 * 账号系统：Better Auth + PostgreSQL（pg 连接池，纯 JavaScript，可跨 CPU 架构运行）。
 *
 * 登录方式：Google、LINE（只启用已配置了密钥的方式）。
 * 账号表（user / session / account / verification）由 Better Auth 管理，
 * AUTO_MIGRATE=true 时在服务启动时自动创建（见 instrumentation.ts）。
 */
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { Pool } from 'pg';

const env = process.env;

const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
const lineEnabled = Boolean(env.LINE_CLIENT_ID && env.LINE_CLIENT_SECRET);

export type LoginProvider = 'line' | 'google';

/** 已配置的登录方式；泰国用户以 LINE 为主，排在前面 */
export const enabledProviders: LoginProvider[] = [
  ...(lineEnabled ? (['line'] as const) : []),
  ...(googleEnabled ? (['google'] as const) : []),
];

export const auth = betterAuth({
  appName: 'Lucky',
  baseURL: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  secret: env.BETTER_AUTH_SECRET,
  database: new Pool({ connectionString: env.DATABASE_URL }),
  user: {
    additionalFields: {
      // 界面语言，登录后在网站和 App 之间同步
      locale: { type: 'string', required: false, defaultValue: 'th' },
    },
  },
  account: {
    // 同一个邮箱用 Google 和 LINE 登录时合并为同一个账号
    accountLinking: { enabled: true, trustedProviders: ['google', 'line'] },
  },
  socialProviders: {
    ...(googleEnabled && {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        prompt: 'select_account' as const,
      },
    }),
    ...(lineEnabled && {
      line: {
        clientId: env.LINE_CLIENT_ID!,
        clientSecret: env.LINE_CLIENT_SECRET!,
        // LINE 只有在渠道申请了邮箱权限、且用户同意后才返回邮箱；
        // 没有邮箱时用不可投递的占位地址（.invalid 保留域名），账号仍可正常使用
        mapProfileToUser: (profile: { sub?: string; email?: string }) =>
          profile.email ? {} : { email: `line-${profile.sub}@users.line.invalid`, emailVerified: false },
      },
    }),
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

/** 占位邮箱不显示给用户 */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !email || email.endsWith('.invalid');
}
