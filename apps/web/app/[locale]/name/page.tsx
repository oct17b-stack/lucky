import { getMessages } from '@lucky/content';
import { NameForm } from '@/components/NameForm';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'name');
}

export default async function NamePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.name.title}</h1>
      <p className="lead">{m.name.description}</p>
      <NameForm locale={locale} m={m} />
    </article>
  );
}
