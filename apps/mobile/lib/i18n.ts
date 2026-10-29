import { getMessages, negotiateLocale, type Locale } from '@lucky/content';

/** 按设备语言选择界面语言；阶段 2 改为登录后读取账号设置 */
export const deviceLocale: Locale = negotiateLocale(Intl.DateTimeFormat().resolvedOptions().locale);
export const t = getMessages(deviceLocale);

/** 测试版指向 NAS（例如 https://beta.example.com），本地开发指向电脑的局域网地址 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
