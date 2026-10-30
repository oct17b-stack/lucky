import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, format, getMessages, type Locale, type Messages } from '@lucky/content';
import { HOUSE_NAMES, THAI_BIRTH_DAYS, dailyTaksaReading, todayIn, type ThaiBirthDayKey } from '@lucky/core';
import { ShareButtons } from '@/components/ShareButtons';
import { addDays } from '@/lib/calendar';
import { formatDateFull, formatDateShort } from '@/lib/dates';
import { paren } from '@/lib/format';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string; day: string }> };

/** 每小时重新生成，“今天”按曼谷时间 */
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => THAI_BIRTH_DAYS.map((d) => ({ locale, day: d.key })));
}

async function load(params: Props['params']) {
  const locale = await resolveLocale(params);
  const { day } = await params;
  const info = THAI_BIRTH_DAYS.find((d) => d.key === (day as ThaiBirthDayKey));
  if (!info) notFound();
  return { locale, info };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, info } = await load(params);
  const m = getMessages(locale);
  return {
    title: format(m.horoscope.title, { day: info.name[locale] }),
    description: m.horoscope.description,
    alternates: alternatesFor(locale, `/horoscope/${info.key}`),
  };
}

function houseLabel(h: keyof typeof HOUSE_NAMES, locale: Locale): string {
  return locale === 'th' ? HOUSE_NAMES[h].th : paren(locale, HOUSE_NAMES[h][locale], HOUSE_NAMES[h].th);
}

export default async function HoroscopePage({ params }: Props) {
  const { locale, info } = await load(params);
  const m = getMessages(locale);
  const today = todayIn('Asia/Bangkok');
  const r = dailyTaksaReading(info.key, today.year, today.month, today.day);
  const title = format(m.horoscope.title, { day: info.name[locale] });

  return (
    <article className="tool">
      <h1>{title}</h1>
      <p className="lead">{formatDateFull(locale, today)}</p>
      <section className={`horoscope-card house-${r.house}`}>
        <h2>{format(m.horoscope.todayIs, { house: houseLabel(r.house, locale) })}</h2>
        <p>{m.horoscope.themes[r.house]}</p>
        <p className="merit">
          <strong className="block">{m.horoscope.meritTitle}</strong>
          {m.horoscope.merit[r.house]}
        </p>
        <dl className="facts">
          <dt>{m.horoscope.luckyNumbers}</dt>
          <dd className="big-number">{r.luckyNumbers.join(' · ')}</dd>
          <ColorFact label={m.horoscope.yourMoneyColor} c={r.colors.money.color} locale={locale} />
          <ColorFact label={m.horoscope.yourWorkColor} c={r.colors.work.color} locale={locale} />
          <ColorFact label={m.horoscope.avoidToday} c={r.colors.avoid.color} locale={locale} />
        </dl>
      </section>
      <ShareButtons t={m.share} text={`${title} · ${format(m.horoscope.todayIs, { house: houseLabel(r.house, locale) })}`} />

      <h2>{m.horoscope.week}</h2>
      <WeekList birthDay={info.key} locale={locale} m={m} />

      <p>
        <Link href={`/${locale}/lucky-color/${info.key}`}>{m.taksa.title} →</Link>
      </p>
    </article>
  );
}

function ColorFact({ label, c, locale }: { label: string; c: { hex: string } & Record<Locale, string>; locale: Locale }) {
  return (
    <>
      <dt>{label}</dt>
      <dd className="color-cell">
        <span className="swatch inline-swatch" style={{ background: c.hex }} aria-hidden /> {c[locale]}
      </dd>
    </>
  );
}

function WeekList({ birthDay, locale, m }: { birthDay: ThaiBirthDayKey; locale: Locale; m: Messages }) {
  const today = todayIn('Asia/Bangkok');
  return (
    <ol className="week-list">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(today, i);
        const r = dailyTaksaReading(birthDay, d.year, d.month, d.day);
        return (
          <li key={i} className={r.house === 'kalakini' ? 'kalakini' : undefined}>
            <span className="week-date">{formatDateShort(locale, d)}</span>
            <strong>{houseLabel(r.house, locale)}</strong>
            <span className="hint">{m.taksa.houses[r.house]}</span>
          </li>
        );
      })}
    </ol>
  );
}
