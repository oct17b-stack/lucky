import { getMessages } from '@lucky/content';
import { SiamsiDraw } from '@/components/SiamsiDraw';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'siamsi');
}

export default async function SiamsiPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.siamsi.title}</h1>
      <p className="lead">{m.siamsi.description}</p>
      <SiamsiDraw locale={locale} m={m} />
    </article>
  );
}
