'use client';

/**
 * 八字排盘表单：计算核心直接在浏览器里运行，不需要请求服务器。
 * 正式版登录后会把命盘保存到服务端（charts 表）。
 */
import { useState } from 'react';
import {
  CITIES,
  computeBazi,
  formatLunarChinese,
  interpretBazi,
  lunarToSolar,
  solarToLunar,
  type BaziReading,
  type BaziResult,
  type LunarDate,
  type Pillar,
  type ZiHourRule,
} from '@lucky/core';
import { format, renderBaziReading, type Locale, type Messages } from '@lucky/content';

const ELEMENT_CLASS: Record<string, string> = { 木: 'el-wood', 火: 'el-fire', 土: 'el-earth', 金: 'el-metal', 水: 'el-water' };

interface Outcome {
  chart: BaziResult;
  reading: BaziReading;
  lunar: LunarDate;
}

export function BaziForm({ locale, t }: { locale: Locale; t: Messages['bazi'] }) {
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [date, setDate] = useState('1990-06-15');
  const [lunar, setLunar] = useState({ year: 1990, month: 5, day: 23, leap: false });
  const [time, setTime] = useState('08:30');
  const [cityId, setCityId] = useState('bangkok');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [trueSolarTime, setTrueSolarTime] = useState(true);
  const [ziHour, setZiHour] = useState<ZiHourRule>('next-day-at-23');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let y: number | undefined, mo: number | undefined, d: number | undefined;
      if (calendar === 'lunar') {
        ({ year: y, month: mo, day: d } = lunarToSolar(lunar.year, lunar.month, lunar.day, lunar.leap));
      } else {
        [y, mo, d] = date.split('-').map(Number);
      }
      const [h, mi] = time.split(':').map(Number);
      const city = CITIES.find((c) => c.id === cityId);
      if (!city || !y || !mo || !d || h === undefined || mi === undefined) throw new Error('invalid');
      const chart = computeBazi({
        birth: { year: y, month: mo, day: d, hour: h, minute: mi },
        timeZone: city.timeZone,
        longitude: city.lng,
        gender,
        options: { trueSolarTime, ziHour },
      });
      setOutcome({ chart, reading: interpretBazi(chart), lunar: solarToLunar(y, mo, d) });
      setError(null);
    } catch {
      setOutcome(null);
      setError(t.error);
    }
  }

  const f = t.form;
  const r = t.result;
  const result = outcome?.chart;

  return (
    <>
      <form className="form" onSubmit={submit}>
        <fieldset>
          <legend>{f.calendarType}</legend>
          <label className="inline">
            <input type="radio" checked={calendar === 'solar'} onChange={() => setCalendar('solar')} /> {f.solar}
          </label>
          <label className="inline">
            <input type="radio" checked={calendar === 'lunar'} onChange={() => setCalendar('lunar')} /> {f.lunar}
          </label>
        </fieldset>
        {calendar === 'solar' ? (
          <label>
            {f.date}
            <input type="date" value={date} min="1901-02-19" max="2099-12-31" onChange={(e) => setDate(e.target.value)} required />
          </label>
        ) : (
          <div className="lunar-fields">
            <label>
              {f.lunarYear}
              <input
                type="number"
                min={1901}
                max={2099}
                value={lunar.year}
                onChange={(e) => setLunar({ ...lunar, year: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              {f.lunarMonth}
              <select value={lunar.month} onChange={(e) => setLunar({ ...lunar, month: Number(e.target.value) })}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {f.lunarDay}
              <select value={lunar.day} onChange={(e) => setLunar({ ...lunar, day: Number(e.target.value) })}>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline">
              <input type="checkbox" checked={lunar.leap} onChange={(e) => setLunar({ ...lunar, leap: e.target.checked })} /> {f.leapMonth}
            </label>
          </div>
        )}
        <label>
          {f.time}
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <label>
          {f.city}
          <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{f.gender}</legend>
          <label className="inline">
            <input type="radio" checked={gender === 'male'} onChange={() => setGender('male')} /> {f.male}
          </label>
          <label className="inline">
            <input type="radio" checked={gender === 'female'} onChange={() => setGender('female')} /> {f.female}
          </label>
        </fieldset>
        <label className="inline">
          <input type="checkbox" checked={trueSolarTime} onChange={(e) => setTrueSolarTime(e.target.checked)} /> {f.trueSolarTime}
        </label>
        <label>
          {f.ziHour}
          <select value={ziHour} onChange={(e) => setZiHour(e.target.value as ZiHourRule)}>
            <option value="next-day-at-23">{f.ziNextDay}</option>
            <option value="split">{f.ziSplit}</option>
          </select>
        </label>
        <button className="button" type="submit">
          {f.submit}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {outcome && result && (
        <section className="result" aria-live="polite">
          <table className="pillars">
            <thead>
              <tr>
                <th />
                <th>{r.year}</th>
                <th>{r.month}</th>
                <th>{r.day}</th>
                <th>{r.hour}</th>
              </tr>
            </thead>
            <tbody>
              <PillarRow label={r.tenGod} pillars={result.pillars} render={(p) => p.stemTenGod ?? r.dayMaster} />
              <PillarRow
                label=""
                pillars={result.pillars}
                render={(p) => <span className={`glyph ${ELEMENT_CLASS[p.stemElement]}`}>{p.stem}</span>}
              />
              <PillarRow
                label=""
                pillars={result.pillars}
                render={(p) => <span className={`glyph ${ELEMENT_CLASS[p.branchElement]}`}>{p.branch}</span>}
              />
              <PillarRow
                label={r.hiddenStems}
                pillars={result.pillars}
                render={(p) => p.hiddenStems.map((h) => `${h.stem}${h.tenGod}`).join(' ')}
              />
              <PillarRow label={r.nayin} pillars={result.pillars} render={(p) => p.nayin} />
            </tbody>
          </table>

          <dl className="facts">
            <dt>{r.dayMaster}</dt>
            <dd>
              {result.dayMaster.stem}（{result.dayMaster.element}）
            </dd>
            <dt>{r.zodiac}</dt>
            <dd>{result.zodiac}</dd>
            <dt>{r.lunarBirth}</dt>
            <dd>
              {outcome.lunar.year} · {formatLunarChinese(outcome.lunar, locale === 'zh-hant')}
            </dd>
            <dt>{r.elements}</dt>
            <dd className="elements">
              {Object.entries(result.elementCount).map(([el, n]) => (
                <span key={el} className={ELEMENT_CLASS[el]}>
                  {el} {n}
                </span>
              ))}
            </dd>
          </dl>

          <h2>{t.reading.title}</h2>
          <div className="reading">
            {renderBaziReading(outcome.reading.conclusions, locale).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="hint">{format(t.reading.rulesNote, { version: outcome.reading.rulesVersion })}</p>
          </div>

          <h2>{r.luck}</h2>
          <p>
            {format(r.luckStart, { years: result.luck.startAge.years, months: result.luck.startAge.months })} ·{' '}
            {result.luck.forward ? r.luckDirection.forward : r.luckDirection.backward}
          </p>
          <ol className="luck">
            {result.luck.pillars.map((lp) => (
              <li key={lp.name}>
                <strong>{lp.name}</strong>
                <span>
                  {Math.floor(lp.startAge)}+ · {lp.startYear}
                </span>
              </li>
            ))}
          </ol>

          <details className="meta">
            <summary>{r.rulesNote}</summary>
            <ul>
              <li>
                {r.calcTime}: {result.meta.calcTime}
              </li>
              <li>UTC: {result.meta.utc}</li>
              <li>
                {f.trueSolarTime}: {String(result.meta.options.trueSolarTime)} · {f.ziHour}: {result.meta.options.ziHour}
              </li>
              <li>
                engine {result.meta.engineVersion} · {result.meta.sunModel}
              </li>
            </ul>
          </details>
        </section>
      )}
    </>
  );
}

function PillarRow({
  label,
  pillars,
  render,
}: {
  label: string;
  pillars: BaziResult['pillars'];
  render: (p: Pillar) => React.ReactNode;
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{render(pillars.year)}</td>
      <td>{render(pillars.month)}</td>
      <td>{render(pillars.day)}</td>
      <td>{render(pillars.hour)}</td>
    </tr>
  );
}
