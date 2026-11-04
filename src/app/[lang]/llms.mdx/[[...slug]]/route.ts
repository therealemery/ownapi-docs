import { getLLMText, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { isHiddenDocSlug } from '@/lib/hidden-docs';

export const revalidate = false;
export const dynamic = 'force-static';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; slug?: string[] }> }
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);

  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source
    .generateParams()
    .filter(({ slug }) => !isHiddenDocSlug(slug));
}
