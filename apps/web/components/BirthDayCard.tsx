import type { ThaiBirthDayInfo } from '@lucky/core';
import type { Locale, Messages } from '@lucky/content';

export function BirthDayCard({ info, locale, t }: { info: ThaiBirthDayInfo; locale: Locale; t: Messages['birthday'] }) {
  return (
    <div className="birthday-card" style={{ '--day-color': info.color.hex } as React.CSSProperties}>
      <div className="swatch large" aria-hidden />
      <dl className="facts">
        <dt>{t.yourDay}</dt>
        <dd>{info.name[locale]}</dd>
        <dt>{t.color}</dt>
        <dd>{locale === 'th' ? info.color.th : `${info.color.en}（${info.color.th}）`}</dd>
        <dt>{t.buddha}</dt>
        <dd>{info.buddha.th}</dd>
        <dt>{t.planet}</dt>
        <dd>{info.planetNumber}</dd>
      </dl>
    </div>
  );
}
