import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages } from '@lucky/content';
import { dailyAlmanac } from '@lucky/core';
import { AlmanacView } from '@/components/AlmanacView';
import { parseYmd } from '@/lib/calendar';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string; date: string }> };

/** 程序化 SEO：每个日期一页，首次访问时生成并长期缓存（内容由日期唯一确定） */
export const revalidate = 2_592_000;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

async function load(params: Props['params']) {
  const locale = await resolveLocale(params);
  const { date } = await params;
  const ymd = parseYmd(date);
  if (!ymd) notFound();
  return { locale, date, almanac: dailyAlmanac(ymd.year, ymd.month, ymd.day) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date, almanac } = await load(params);
  const m = getMessages(locale);
  return {
    title: `${date} · ${m.calendar.title}`,
    description: `${date} · ${m.calendar.lunar} ${almanac.lunar.chinese} · ${almanac.ganzhi.day} · ${m.calendar.description}`,
    alternates: alternatesFor(locale, `/calendar/${date}`),
  };
}

export default async function CalendarDayPage({ params }: Props) {
  const { locale, date, almanac } = await load(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>
        {m.calendar.title} · {date}
      </h1>
      <AlmanacView a={almanac} locale={locale} t={m.calendar} />
    </article>
  );
}
