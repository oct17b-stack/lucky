'use client';

import { createAuthClient } from 'better-auth/react';

/** 浏览器端：与网站同源，调用 /api/auth/* */
export const authClient = createAuthClient();
