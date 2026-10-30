import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, getMessages } from '@lucky/content';
import { THAI_BIRTH_DAYS, type ThaiBirthDayKey } from '@lucky/core';
import Link from 'next/link';
import { BirthDayCard } from '@/components/BirthDayCard';
import { ShareButtons } from '@/components/ShareButtons';
import { TaksaTable } from '@/components/TaksaTable';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string; day: string }> };

/** 程序化 SEO 页面：4 种语言 × 8 类生日星期 = 32 个静态页面 */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => THAI_BIRTH_DAYS.map((d) => ({ locale, day: d.key })));
}

function findDay(key: string) {
  const info = THAI_BIRTH_DAYS.find((d) => d.key === (key as ThaiBirthDayKey));
  if (!info) notFound();
  return info;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { day } = await params;
  const info = findDay(day);
  const m = getMessages(locale);
  return {
    title: `${info.name[locale]} · ${m.birthday.color}`,
    description: `${info.name[locale]}: ${m.birthday.color} ${locale === 'th' ? info.color.th : info.color.en}, ${m.birthday.buddha} ${info.buddha.th}`,
    alternates: alternatesFor(locale, `/lucky-color/${day}`),
  };
}

export default async function BirthDayPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const { day } = await params;
  const info = findDay(day);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{info.name[locale]}</h1>
      <BirthDayCard info={info} locale={locale} t={m.birthday} />
      <ShareButtons t={m.share} text={info.name[locale]} />
      <TaksaTable day={info.key} locale={locale} t={m.taksa} />
      <p>
        <Link className="button" href={`/${locale}/horoscope/${info.key}`}>
          {m.nav2.horoscope}
        </Link>
      </p>
    </article>
  );
}
