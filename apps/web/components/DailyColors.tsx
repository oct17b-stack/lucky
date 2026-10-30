import { dailyColors, type ColorPurpose } from '@lucky/core';
import type { Locale, Messages } from '@lucky/content';

const ORDER: ColorPurpose[] = ['work', 'money', 'patron', 'charm', 'health', 'success', 'stability', 'avoid'];

/** 某个星期几的幸运色卡片 */
export function DailyColors({ weekday, locale, t, compact = false }: { weekday: number; locale: Locale; t: Messages['dailyColor']; compact?: boolean }) {
  const colors = dailyColors(weekday);
  const purposes = compact ? (['work', 'money', 'patron', 'avoid'] as ColorPurpose[]) : ORDER;
  return (
    <ul className={`color-grid${compact ? ' compact' : ''}`}>
      {purposes.map((p) => {
        const c = colors[p].color;
        return (
          <li key={p} className={p === 'avoid' ? 'avoid' : undefined}>
            <span className="swatch big-swatch" style={{ background: c.hex }} aria-hidden />
            <span className="color-purpose">{t.purposes[p]}</span>
            <strong className="color-name">{c[locale]}</strong>
          </li>
        );
      })}
    </ul>
  );
}

export const WEEKDAY_SLUGS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export type WeekdaySlug = (typeof WEEKDAY_SLUGS)[number];
