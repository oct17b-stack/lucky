import Link from 'next/link';
import { getMessages } from '@lucky/content';
import { resolveLocale } from '@/lib/site';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const f = m.home.features;
  const cards = [
    { href: `/${locale}/lucky-color`, ...f.birthday },
    { href: `/${locale}/phone-number`, ...f.phone },
    { href: `/${locale}/bazi`, ...f.bazi },
  ];

  return (
    <>
      <section className="hero">
        <h1>{m.home.heroTitle}</h1>
        <p>{m.home.heroSubtitle}</p>
        <Link className="button" href={`/${locale}/lucky-color`}>
          {m.home.cta}
        </Link>
      </section>
      <section className="cards">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card">
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
