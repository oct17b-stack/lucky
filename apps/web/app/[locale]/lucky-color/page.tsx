import type { Metadata } from 'next';
import Link from 'next/link';
import { getMessages } from '@lucky/content';
import { THAI_BIRTH_DAYS } from '@lucky/core';
import { BirthdayForm } from '@/components/BirthdayForm';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: m.birthday.title, description: m.birthday.description, alternates: alternatesFor(locale, '/lucky-color') };
}

export default async function LuckyColorPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.birthday.title}</h1>
      <p className="lead">{m.birthday.description}</p>
      <BirthdayForm locale={locale} t={m.birthday} />

      <h2>{m.birthday.allDays}</h2>
      <ul className="day-grid">
        {THAI_BIRTH_DAYS.map((d) => (
          <li key={d.key}>
            <Link href={`/${locale}/lucky-color/${d.key}`} className="day-chip">
              <span className="swatch" style={{ background: d.color.hex }} aria-hidden />
              {d.name[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
