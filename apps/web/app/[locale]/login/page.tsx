import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMessages } from '@lucky/content';
import { LoginButtons } from '@/components/LoginButtons';
import { auth, enabledProviders } from '@/lib/auth';
import { resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { title: getMessages(locale).auth.title, robots: { index: false, follow: false } };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const t = getMessages(locale).auth;
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (session) redirect(`/${locale}/me`);
  const { error } = await searchParams;

  return (
    <article className="tool narrow">
      <h1>{t.title}</h1>
      <p className="lead">{t.subtitle}</p>
      {error && <p className="error">{t.failed}</p>}
      {enabledProviders.length > 0 ? (
        <LoginButtons providers={enabledProviders} locale={locale} t={t} />
      ) : (
        <p className="hint">{t.notConfigured}</p>
      )}
      <p className="hint">{t.terms}</p>
    </article>
  );
}
