import type { Metadata } from 'next';
import { getMessages } from '@lucky/content';
import { PhoneForm } from '@/components/PhoneForm';
import { alternatesFor, resolveLocale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: m.phone.title, description: m.phone.description, alternates: alternatesFor(locale, '/phone-number') };
}

export default async function PhonePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.phone.title}</h1>
      <p className="lead">{m.phone.description}</p>
      <PhoneForm t={m.phone} />
    </article>
  );
}
