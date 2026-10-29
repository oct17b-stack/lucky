import type { Metadata } from 'next';
import { getMessages } from '@lucky/content';
import { BaziForm } from '@/components/BaziForm';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: m.bazi.title, description: m.bazi.description, alternates: alternatesFor(locale, '/bazi') };
}

export default async function BaziPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.bazi.title}</h1>
      <p className="lead">{m.bazi.description}</p>
      <BaziForm locale={locale} t={m.bazi} />
    </article>
  );
}
