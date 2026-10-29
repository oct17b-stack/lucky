'use client';

/**
 * 页头的登录状态。在浏览器端读取会话，不影响内容页的静态生成和缓存（SEO 页面仍是静态的）。
 */
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function UserMenu({ locale, loginLabel }: { locale: string; loginLabel: string }) {
  const { data, isPending } = authClient.useSession();
  if (isPending) return <span className="user-menu" aria-hidden />;
  if (!data) {
    return (
      <Link href={`/${locale}/login`} className="user-menu login-link">
        {loginLabel}
      </Link>
    );
  }
  const { user } = data;
  return (
    <Link href={`/${locale}/me`} className="user-menu">
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.image} alt="" width={28} height={28} className="avatar small" />
      ) : (
        <span className="avatar small placeholder" aria-hidden />
      )}
      <span className="user-name">{user.name}</span>
    </Link>
  );
}
