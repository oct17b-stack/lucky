import { getMessages } from '@lucky/content';
import { TarotDraw } from '@/components/TarotDraw';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'tarot');
}

export default async function TarotPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.tarot.title}</h1>
      <p className="lead">{m.tarot.description}</p>
      <TarotDraw locale={locale} m={m} />
    </article>
  );
}
