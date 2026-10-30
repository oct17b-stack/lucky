import { getMessages } from '@lucky/content';
import { WallpaperMaker } from '@/components/WallpaperMaker';
import { resolveLocale } from '@/lib/site';
import { toolMetadata } from '@/lib/tool-page';

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return toolMetadata(params, 'wallpaper');
}

export default async function WallpaperPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <article className="tool">
      <h1>{m.wallpaper.title}</h1>
      <p className="lead">{m.wallpaper.description}</p>
      <WallpaperMaker locale={locale} m={m} />
    </article>
  );
}
