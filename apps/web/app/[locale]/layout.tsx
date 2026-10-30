import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Noto_Sans_Thai } from 'next/font/google';
import { LOCALES, LOCALE_META, getMessages } from '@lucky/content';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserMenu } from '@/components/UserMenu';
import { IS_STAGING, SITE_URL, alternatesFor, resolveLocale } from '@/lib/site';
import { TOOL_PATHS, navTools, toolLabel } from '@/lib/tools';
import '../globals.css';

const thaiFont = Noto_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['400', '600', '700'], display: 'swap' });

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${m.site.name} · ${m.site.tagline}`, template: `%s · ${m.site.name}` },
    description: m.site.description,
    alternates: alternatesFor(locale, ''),
    openGraph: { siteName: m.site.name, locale: LOCALE_META[locale].ogLocale, type: 'website' },
    robots: IS_STAGING ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = { themeColor: '#7a1f2b', width: 'device-width', initialScale: 1 };

export default async function LocaleLayout({ children, params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <html lang={LOCALE_META[locale].htmlLang}>
      <body className={thaiFont.className}>
        {IS_STAGING && <div className="beta-banner">{m.common.betaBanner}</div>}
        <header className="site-header">
          <Link href={`/${locale}`} className="brand">
            {m.site.name}
          </Link>
          <nav className="site-nav">
            {navTools(locale).map((key) => (
              <Link key={key} href={`/${locale}${TOOL_PATHS[key]}`}>
                {toolLabel(key, m, locale)}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher current={locale} label={m.nav.language} />
          <UserMenu locale={locale} loginLabel={m.auth.login} />
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <p>{m.common.disclaimer}</p>
        </footer>
      </body>
    </html>
  );
}
