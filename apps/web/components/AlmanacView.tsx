import Link from 'next/link';
import { ZODIAC_NAMES, formatThaiLunar, solarTermLabel, type DailyAlmanac } from '@lucky/core';
import { format, type Locale, type Messages } from '@lucky/content';
import { addDays, formatYmd } from '@/lib/calendar';
import { formatDateFull } from '@/lib/dates';

function lunarText(a: DailyAlmanac, locale: Locale, t: Messages['calendar']): string {
  if (locale === 'zh-hans') return a.lunar.chinese;
  if (locale === 'zh-hant') return a.lunar.chinese.replace('闰', '閏').replace('腊', '臘');
  return `${a.lunar.leap ? t.leapMark : ''}${format(t.lunarFormat, { month: a.lunar.month, day: a.lunar.day })}`;
}

/** 泰文显示佛历（พ.ศ.），其他语言显示公历 */
function gregorianText(a: DailyAlmanac, locale: Locale): string {
  return formatDateFull(locale, a.date);
}

function termTime(utc: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }).format(new Date(utc));
}

function thaiLunarText(a: DailyAlmanac, locale: Locale, tl: Messages['thaiLunar']): string {
  if (locale === 'th') return formatThaiLunar(a.thaiLunar);
  const month = `${a.thaiLunar.month}${a.thaiLunar.secondEighth ? (locale === 'en' ? ' (2nd)' : '（后）') : ''}`;
  return format(tl.format, { side: a.thaiLunar.waxing ? tl.waxing : tl.waning, day: a.thaiLunar.day, month });
}

export function AlmanacView({ a, locale, t, tl }: { a: DailyAlmanac; locale: Locale; t: Messages['calendar']; tl: Messages['thaiLunar'] }) {
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
        <dt>{tl.title}</dt>
        <dd>
          {thaiLunarText(a, locale, tl)}
          {a.thaiLunar.holyDay && <span className="badge holy">{tl.holyDay}</span>}
          <span className="hint block">{tl.yearType[a.thaiLunar.yearType]}</span>
        </dd>
        {a.auspicious.length > 0 && (
          <>
            <dt>{tl.auspicious}</dt>
            <dd>
              {a.auspicious.map((k) => (
                <span key={k} className={`block auspicious-${k}`}>
                  {tl[k]}
                </span>
              ))}
            </dd>
          </>
        )}
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
