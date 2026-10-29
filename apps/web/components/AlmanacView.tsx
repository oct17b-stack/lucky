import Link from 'next/link';
import { ZODIAC_NAMES, solarTermLabel, type DailyAlmanac } from '@lucky/core';
import { format, type Locale, type Messages } from '@lucky/content';
import { addDays, formatYmd } from '@/lib/calendar';

function lunarText(a: DailyAlmanac, locale: Locale, t: Messages['calendar']): string {
  if (locale === 'zh-hans') return a.lunar.chinese;
  if (locale === 'zh-hant') return a.lunar.chinese.replace('闰', '閏').replace('腊', '臘');
  return `${a.lunar.leap ? t.leapMark : ''}${format(t.lunarFormat, { month: a.lunar.month, day: a.lunar.day })}`;
}

function gregorianText(a: DailyAlmanac, locale: Locale): string {
  const date = new Date(Date.UTC(a.date.year, a.date.month - 1, a.date.day));
  const tag = locale === 'th' ? 'th-TH-u-ca-gregory' : locale === 'zh-hans' ? 'zh-CN' : locale === 'zh-hant' ? 'zh-TW' : 'en-GB';
  return new Intl.DateTimeFormat(tag, { dateStyle: 'full', timeZone: 'UTC' }).format(date);
}

function termTime(utc: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }).format(new Date(utc));
}

export function AlmanacView({ a, locale, t }: { a: DailyAlmanac; locale: Locale; t: Messages['calendar'] }) {
  const prev = formatYmd(addDays(a.date, -1));
  const next = formatYmd(addDays(a.date, 1));
  const animal = ZODIAC_NAMES[locale][a.clashZodiacIndex]!;

  return (
    <section className="almanac" style={{ '--day-color': a.weekday.color.hex } as React.CSSProperties}>
      <div className="almanac-head">
        <p className="almanac-date">{gregorianText(a, locale)}</p>
        <p className="almanac-lunar">
          {t.lunar} {lunarText(a, locale, t)}
        </p>
      </div>
      <dl className="facts">
        <dt>{t.buddhist}</dt>
        <dd>{a.buddhistYear}</dd>
        <dt>{t.ganzhi}</dt>
        <dd>
          {a.ganzhi.year} · {a.ganzhi.month} · {a.ganzhi.day}
          <span className="hint block">{t.ganzhiNote}</span>
        </dd>
        <dt>{t.clash}</dt>
        <dd>{format(t.clashFormat, { animal })}</dd>
        <dt>{t.solarTerm}</dt>
        <dd>{a.solarTerm ? format(t.solarTermAt, { name: solarTermLabel(a.solarTerm.name, locale), time: termTime(a.solarTerm.utc) }) : t.none}</dd>
        <dt>{t.weekdayColor}</dt>
        <dd className="color-cell">
          <span className="swatch" aria-hidden />
          {a.weekday.name[locale]} · {locale === 'th' ? a.weekday.color.th : a.weekday.color.en}
        </dd>
      </dl>
      <nav className="pager">
        <Link href={`/${locale}/calendar/${prev}`} rel="prev">
          ← {t.prev}
        </Link>
        <Link href={`/${locale}/calendar/${next}`} rel="next">
          {t.next} →
        </Link>
      </nav>
    </section>
  );
}
