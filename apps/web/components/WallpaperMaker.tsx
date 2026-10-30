'use client';

/**
 * 幸运壁纸：在浏览器里用 canvas 生成 1080×1920 的 PNG。
 * 图案是本站原创的几何设计：渐变底色 + ทักษา 八曜色环 + 幸运数字，不使用宗教图像。
 */
import { useEffect, useRef, useState } from 'react';
import { PLANETS, TAKSA_HOUSES, taksaChart, thaiBirthDayByKey, type TaksaHouse, type ThaiBirthDayKey } from '@lucky/core';
import { THAI_BIRTH_DAYS } from '@lucky/core';
import type { Locale, Messages } from '@lucky/content';

type Purpose = 'money' | 'work' | 'love';

/** 用途 → 主色、辅色所在的宫位 */
const PURPOSE_HOUSES: Record<Purpose, [TaksaHouse, TaksaHouse]> = {
  money: ['si', 'mula'],
  work: ['det', 'montri'],
  love: ['si', 'boriwan'],
};

const W = 1080;
const H = 1920;

export function WallpaperMaker({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.wallpaper;
  const [day, setDay] = useState<ThaiBirthDayKey>('mon');
  const [purpose, setPurpose] = useState<Purpose>('money');
  const [url, setUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(canvas, day, purpose, locale, t.purposes[purpose]);
    setUrl(canvas.toDataURL('image/png'));
  }, [day, purpose, locale, t]);

  return (
    <section className="wallpaper">
      <div className="form">
        <label>
          {m.birthday.yourDay}
          <select value={day} onChange={(e) => setDay(e.target.value as ThaiBirthDayKey)}>
            {THAI_BIRTH_DAYS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{t.purpose}</legend>
          {(Object.keys(PURPOSE_HOUSES) as Purpose[]).map((p) => (
            <label key={p} className="inline">
              <input type="radio" checked={purpose === p} onChange={() => setPurpose(p)} /> {t.purposes[p]}
            </label>
          ))}
        </fieldset>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="wallpaper-preview" />
      {url && (
        <a className="button" href={url} download={`lucky-wallpaper-${day}-${purpose}.png`}>
          {t.download}
        </a>
      )}
    </section>
  );
}

function draw(canvas: HTMLCanvasElement, day: ThaiBirthDayKey, purpose: Purpose, locale: Locale, purposeLabel: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const chart = taksaChart(day);
  const [h1, h2] = PURPOSE_HOUSES[purpose];
  const main = PLANETS[chart[h1]];
  const second = PLANETS[chart[h2]];
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif';

  // 底色：主色到辅色的竖向渐变，再盖一层暗色让文字清晰
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, main.color.hex);
  g.addColorStop(1, second.color.hex);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 0, W, H);

  // 八曜色环（กาลกิณี 不画）
  const cx = W / 2;
  const cy = H * 0.42;
  const ring = 330;
  TAKSA_HOUSES.filter((h) => h !== 'kalakini').forEach((h, i, arr) => {
    const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring, 46, 0, Math.PI * 2);
    ctx.fillStyle = PLANETS[chart[h]].color.hex;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
  });

  // 中心圆与幸运数字
  ctx.beginPath();
  ctx.arc(cx, cy, 210, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.fillStyle = main.color.hex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 240px ${font}`;
  ctx.fillText(String(main.number), cx, cy + 10);

  // 文字
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 76px ${font}`;
  ctx.fillText(thaiBirthDayByKey(day).name[locale], cx, H * 0.7);
  ctx.font = `400 56px ${font}`;
  ctx.fillText(`${purposeLabel} · ${main.color[locale]}`, cx, H * 0.7 + 100);
  ctx.font = `400 36px ${font}`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Lucky', cx, H - 120);
}
