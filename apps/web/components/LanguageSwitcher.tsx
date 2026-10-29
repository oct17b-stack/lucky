'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LOCALES, LOCALE_META, type Locale } from '@lucky/content';
import { LOCALE_COOKIE } from '@/lib/constants';

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function change(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.split('/').slice(2).join('/');
    router.push(`/${next}${rest ? `/${rest}` : ''}`);
  }

  return (
    <label className="lang-switcher">
      <span className="visually-hidden">{label}</span>
      <select value={current} onChange={(e) => change(e.target.value as Locale)} aria-label={label}>
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_META[l].label}
          </option>
        ))}
      </select>
    </label>
  );
}
