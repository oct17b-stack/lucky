'use client';

/** 内网测试版的测试账号登录（邮箱 + 密码）。只有服务端开启 ENABLE_TEST_LOGIN 时才会渲染 */
import { useState } from 'react';
import type { Locale, Messages } from '@lucky/content';
import { authClient } from '@/lib/auth-client';

export function TestLoginForm({ locale, t }: { locale: Locale; t: Messages['auth'] }) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    const { error } =
      mode === 'signUp'
        ? await authClient.signUp.email({ name: name || email.split('@')[0]!, email, password })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (error) {
      setFailed(true);
      return;
    }
    window.location.href = `/${locale}/me`;
  }

  return (
    <form className="form test-login" onSubmit={submit}>
      <h2 className="form-section">{t.testTitle}</h2>
      <p className="hint">{t.testNote}</p>
      {mode === 'signUp' && (
        <label>
          {t.name}
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
        </label>
      )}
      <label>
        {t.email}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        {t.password}
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          required
        />
      </label>
      <button className="button" type="submit" disabled={busy}>
        {mode === 'signUp' ? t.signUp : t.signIn}
      </button>
      {failed && <p className="error">{t.testFailed}</p>}
      <button type="button" className="link-button" onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
        {mode === 'signIn' ? t.toSignUp : t.toSignIn}
      </button>
    </form>
  );
}
