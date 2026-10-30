'use client';

/**
 * 出生信息输入：日 / 月 / 年分开选择（泰文界面年份填佛历），时间可选“不知道”。
 * 泰国用户习惯说“佛历 2533 年”，这里直接输入，不需要自己换算。
 */
import type { Locale, Messages } from '@lucky/content';
import { displayYear, fromDisplayYear, monthNames } from '@/lib/dates';

export interface BirthValue {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hourKnown: boolean;
}

export const DEFAULT_BIRTH: BirthValue = { year: 1990, month: 6, day: 15, hour: 8, minute: 30, hourKnown: true };

export function BirthInput({
  locale,
  t,
  value,
  onChange,
  allowUnknownTime = true,
  idPrefix = 'birth',
}: {
  locale: Locale;
  t: Messages['birthInput'];
  value: BirthValue;
  onChange: (v: BirthValue) => void;
  allowUnknownTime?: boolean;
  idPrefix?: string;
}) {
  const months = monthNames(locale);
  const minYear = displayYear(locale, 1901);
  const maxYear = displayYear(locale, 2099);
  const set = (patch: Partial<BirthValue>) => onChange({ ...value, ...patch });
  const time = `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;

  return (
    <fieldset className="birth-input">
      <legend>{t.date}</legend>
      <div className="birth-date">
        <label>
          <span className="small-label">{t.day}</span>
          <select id={`${idPrefix}-day`} value={value.day} onChange={(e) => set({ day: Number(e.target.value) })}>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="small-label">{t.month}</span>
          <select id={`${idPrefix}-month`} value={value.month} onChange={(e) => set({ month: Number(e.target.value) })}>
            {months.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="small-label">{t.year}</span>
          <input
            id={`${idPrefix}-year`}
            type="number"
            inputMode="numeric"
            min={minYear}
            max={maxYear}
            value={displayYear(locale, value.year)}
            onChange={(e) => set({ year: fromDisplayYear(locale, Number(e.target.value)) })}
            required
          />
        </label>
      </div>
      <label>
        <span className="small-label">{t.time}</span>
        <input
          id={`${idPrefix}-time`}
          type="time"
          value={time}
          disabled={!value.hourKnown}
          onChange={(e) => {
            const [h = 0, m = 0] = e.target.value.split(':').map(Number);
            set({ hour: h, minute: m });
          }}
        />
      </label>
      {allowUnknownTime && (
        <label className="inline">
          <input type="checkbox" checked={!value.hourKnown} onChange={(e) => set({ hourKnown: !e.target.checked })} /> {t.unknownTime}
        </label>
      )}
      {!value.hourKnown && <p className="hint">{t.unknownTimeNote}</p>}
    </fieldset>
  );
}

/** 校验日期是否存在（例如 2 月 30 日） */
export function isValidBirthDate(v: BirthValue): boolean {
  const d = new Date(Date.UTC(v.year, v.month - 1, v.day));
  return d.getUTCFullYear() === v.year && d.getUTCMonth() === v.month - 1 && d.getUTCDate() === v.day && v.year >= 1901 && v.year <= 2099;
}
