import Link from 'next/link';
import { getMessages } from '@lucky/content';
import { todayIn, weekdayOf } from '@lucky/core';
import { DailyColors } from '@/components/DailyColors';
import { formatDateFull } from '@/lib/dates';
import { resolveLocale } from '@/lib/site';
import { TOOL_PATHS, toolDescription, toolLabel, toolOrder } from '@/lib/tools';

/** 首页含“今日幸运色”，每小时重新生成 */
export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const today = todayIn('Asia/Bangkok');
  const tools = toolOrder(locale);
  const chineseFirst = locale === 'zh-hans' || locale === 'zh-hant';

  return (
    <>
      <section className="hero">
        <h1>{chineseFirst ? m.home.heroTitle : m.thaiHome.todayColorTitle}</h1>
        <p>{chineseFirst ? m.home.heroSubtitle : formatDateFull(locale, today)}</p>
      </section>

      <section className="today-colors">
        {chineseFirst && (
          <h2>
            {m.thaiHome.todayColorTitle} · {formatDateFull(locale, today)}
          </h2>
        )}
        <DailyColors weekday={weekdayOf(today.year, today.month, today.day)} locale={locale} t={m.dailyColor} compact />
        <p>
          <Link href={`/${locale}/daily-color`}>{m.dailyColor.title} →</Link>
        </p>
      </section>

      <h2 className="section-title">{m.thaiHome.moreTools}</h2>
      <section className="cards">
        {tools.map((key) => (
          <Link key={key} href={`/${locale}${TOOL_PATHS[key]}`} className="card">
            <h3>{toolLabel(key, m, locale)}</h3>
            <p>{toolDescription(key, m)}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
