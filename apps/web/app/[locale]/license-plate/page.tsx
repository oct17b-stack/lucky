import { getMessages } from '@lucky/content';
import { PlateForm } from '@/components/PlateForm';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'plate');
}

export default async function LicensePlatePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.plate.title}</h1>
      <p className="lead">{m.plate.description}</p>
      <PlateForm m={m} />
    </article>
  );
}
