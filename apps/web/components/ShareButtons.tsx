'use client';

/**
 * 分享按钮：LINE 放在第一位（泰国用户最常用）。
 * LINE 使用官方分享链接 social-plugins.line.me/lineit/share。
 */
import { useEffect, useState } from 'react';
import type { Messages } from '@lucky/content';

export function ShareButtons({ t, text, path }: { t: Messages['share']; text: string; path?: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(path ? new URL(path, window.location.origin).toString() : window.location.href);
  }, [path]);

  if (!url) return null;
  const encoded = encodeURIComponent(url);
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encoded}&text=${encodeURIComponent(text)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 浏览器不允许时静默失败 */
    }
  }

  return (
    <div className="share" aria-label={t.title}>
      <a className="share-btn share-line" href={lineHref} target="_blank" rel="noopener noreferrer">
        {t.line}
      </a>
      <a className="share-btn share-fb" href={fbHref} target="_blank" rel="noopener noreferrer">
        {t.facebook}
      </a>
      <button type="button" className="share-btn" onClick={copy}>
        {copied ? t.copied : t.copy}
      </button>
    </div>
  );
}
