import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, format, getMessages } from '@lucky/content';
import { DailyColors, WEEKDAY_SLUGS, type WeekdaySlug } from '@/components/DailyColors';
import { ShareButtons } from '@/components/ShareButtons';
import { weekdayName } from '@/lib/dates';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string; weekday: string }> };

/** 程序化 SEO：“สีเสื้อมงคลวันจันทร์”等，4 种语言 × 7 天 */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => WEEKDAY_SLUGS.map((weekday) => ({ locale, weekday })));
}

async function load(params: Props['params']) {
  const locale = await resolveLocale(params);
  const { weekday } = await params;
  const index = WEEKDAY_SLUGS.indexOf(weekday as WeekdaySlug);
  if (index < 0) notFound();
  // 2023-01-01 是星期日，用来取星期名称
  const name = weekdayName(locale, { year: 2023, month: 1, day: 1 + index });
  return { locale, weekday, index, name };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, weekday, name } = await load(params);
  const m = getMessages(locale);
  return {
    title: format(m.dailyColor.titleFor, { day: name }),
    description: m.dailyColor.description,
    alternates: alternatesFor(locale, `/daily-color/${weekday}`),
  };
}

export default async function WeekdayColorPage({ params }: Props) {
  const { locale, index, name } = await load(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{format(m.dailyColor.titleFor, { day: name })}</h1>
      <p className="lead">{m.dailyColor.description}</p>
      <DailyColors weekday={index} locale={locale} t={m.dailyColor} />
      <ShareButtons t={m.share} text={format(m.dailyColor.titleFor, { day: name })} />
      <p className="hint">{m.dailyColor.rulesNote}</p>
    </article>
  );
}
