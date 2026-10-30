import type { Metadata } from 'next';
import Link from 'next/link';
import { getMessages } from '@lucky/content';
import { THAI_BIRTH_DAYS } from '@lucky/core';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: m.horoscope.hubTitle, description: m.horoscope.description, alternates: alternatesFor(locale, '/horoscope') };
}

export default async function HoroscopeHub({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.horoscope.hubTitle}</h1>
      <p className="lead">{m.horoscope.description}</p>
      <ul className="day-grid">
        {THAI_BIRTH_DAYS.map((d) => (
          <li key={d.key}>
            <Link href={`/${locale}/horoscope/${d.key}`} className="day-chip">
              <span className="swatch" style={{ background: d.color.hex }} aria-hidden />
              {d.name[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
