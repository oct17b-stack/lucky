import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

/** 登录回调地址：/api/auth/callback/google、/api/auth/callback/line */
export const { GET, POST } = toNextJsHandler(auth);
