import { getMessages } from '@lucky/content';
import { CompatibilityForm } from '@/components/CompatibilityForm';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'compatibility');
}

export default async function CompatibilityPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.compatibility.title}</h1>
      <p className="lead">{m.compatibility.description}</p>
      <CompatibilityForm locale={locale} m={m} />
    </article>
  );
}
