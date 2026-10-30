import { getMessages } from '@lucky/content';
import { ThaiZodiacForm } from '@/components/ThaiZodiacForm';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'zodiac');
}

export default async function ThaiZodiacPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.zodiac.title}</h1>
      <p className="lead">{m.zodiac.description}</p>
      <ThaiZodiacForm locale={locale} m={m} />
    </article>
  );
}
