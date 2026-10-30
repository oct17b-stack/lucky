import type { Metadata } from 'next';
import Link from 'next/link';
import { getMessages } from '@lucky/content';
import { todayIn, weekdayOf } from '@lucky/core';
import { DailyColors, WEEKDAY_SLUGS } from '@/components/DailyColors';
import { ShareButtons } from '@/components/ShareButtons';
import { formatDateFull, weekdayName } from '@/lib/dates';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

/** “今天”按曼谷时间，每小时重新生成 */
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: m.dailyColor.title, description: m.dailyColor.description, alternates: alternatesFor(locale, '/daily-color') };
}

export default async function DailyColorPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const today = todayIn('Asia/Bangkok');
  const wd = weekdayOf(today.year, today.month, today.day);

  return (
    <article className="tool">
      <h1>{m.dailyColor.title}</h1>
      <p className="lead">{formatDateFull(locale, today)}</p>
      <DailyColors weekday={wd} locale={locale} t={m.dailyColor} />
      <ShareButtons t={m.share} text={`${m.dailyColor.title} · ${formatDateFull(locale, today)}`} />
      <p className="hint">{m.dailyColor.rulesNote}</p>

      <h2>{m.dailyColor.weekTitle}</h2>
      <ul className="day-grid">
        {WEEKDAY_SLUGS.map((slug, i) => (
          <li key={slug}>
            <Link href={`/${locale}/daily-color/${slug}`} className="day-chip">
              {weekdayName(locale, { year: 2023, month: 1, day: 1 + i })}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
