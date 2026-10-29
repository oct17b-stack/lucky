'use client';

/**
 * 快速登录按钮。上线前按 LINE 和 Google 的品牌规范替换为官方按钮素材：
 * LINE：https://developers.line.biz/en/docs/line-login/login-button/
 * Google：https://developers.google.com/identity/branding-guidelines
 */
import { useState } from 'react';
import type { Locale, Messages } from '@lucky/content';
import { authClient } from '@/lib/auth-client';
import type { LoginProvider } from '@/lib/auth';

export function LoginButtons({ providers, locale, t }: { providers: LoginProvider[]; locale: Locale; t: Messages['auth'] }) {
  const [busy, setBusy] = useState<LoginProvider | null>(null);
  const [failed, setFailed] = useState(false);

  async function signIn(provider: LoginProvider) {
    setBusy(provider);
    setFailed(false);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: `/${locale}/me`,
      errorCallbackURL: `/${locale}/login?error=1`,
    });
    if (error) {
      setFailed(true);
      setBusy(null);
    }
  }

  return (
    <div className="login-buttons">
      {providers.map((p) => (
        <button key={p} type="button" className={`login-button login-${p}`} disabled={busy !== null} onClick={() => signIn(p)}>
          {p === 'line' ? <LineIcon /> : <GoogleIcon />}
          <span>{p === 'line' ? t.withLine : t.withGoogle}</span>
        </button>
      ))}
      {failed && <p className="error">{t.failed}</p>}
    </div>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3C6.48 3 2 6.6 2 11.05c0 3.99 3.55 7.33 8.34 7.96.33.07.77.22.88.5.1.25.07.65.03.9l-.14.85c-.04.25-.2.98.86.53 1.06-.45 5.73-3.37 7.81-5.77C21.3 14.4 22 12.8 22 11.05 22 6.6 17.52 3 12 3Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.57-5.15 3.57-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.29a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.8l3.43-3.43A11.97 11.97 0 0 0 1.29 6.6l4 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
    </svg>
  );
}
