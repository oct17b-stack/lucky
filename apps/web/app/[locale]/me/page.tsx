import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMessages } from '@lucky/content';
import { SignOutButton } from '@/components/SignOutButton';
import { auth, isPlaceholderEmail } from '@/lib/auth';
import { resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { title: getMessages(locale).auth.meTitle, robots: { index: false, follow: false } };
}

export default async function MePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getMessages(locale).auth;
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) redirect(`/${locale}/login`);
  const { user } = session;

  return (
    <article className="tool narrow">
      <h1>{t.meTitle}</h1>
      <section className="profile-card">
        {user.image ? (
          // 头像来自 Google / LINE，不经过 Next 图片优化
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" width={64} height={64} className="avatar" />
        ) : (
          <div className="avatar placeholder" aria-hidden />
        )}
        <div>
          <p className="hint">{t.signedInAs}</p>
          <p className="profile-name">{user.name}</p>
          {!isPlaceholderEmail(user.email) && <p className="hint">{user.email}</p>}
        </div>
      </section>
      <h2>{t.savedCharts}</h2>
      <p className="hint">{t.comingSoon}</p>
      <SignOutButton locale={locale} label={t.logout} />
    </article>
  );
}
