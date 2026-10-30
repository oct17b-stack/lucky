import type { Metadata } from 'next';
import { getMessages } from '@lucky/content';
import { dailyAlmanac, todayIn } from '@lucky/core';
import { AlmanacView } from '@/components/AlmanacView';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

/** “今天”按曼谷时间计算，每小时重新生成一次 */
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: m.calendar.todayTitle, description: m.calendar.description, alternates: alternatesFor(locale, '/calendar') };
}

export default async function TodayPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const today = todayIn('Asia/Bangkok');
  const a = dailyAlmanac(today.year, today.month, today.day);
  return (
    <article className="tool">
      <h1>{m.calendar.todayTitle}</h1>
      <p className="lead">{m.calendar.description}</p>
      <AlmanacView a={a} locale={locale} t={m.calendar} tl={m.thaiLunar} />
    </article>
  );
}
