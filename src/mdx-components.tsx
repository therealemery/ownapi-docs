import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CommunityQuiz } from '@/components/community-quiz';
import { getAPIPageForLang } from '@/components/api-page';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

export function getMDXComponents(
  components?: MDXComponents & { lang?: string }
): MDXComponents {
  const lang = components?.lang ?? 'en';
  const LocaleAPIPage = getAPIPageForLang(lang);

  return {
    ...(defaultMdxComponents as MDXComponents),
    img: (props) => <ImageZoom {...(props as any)} />,
    CommunityQuiz,
    // APIPage is an async server component, need type assertion to bypass MDX type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    APIPage: LocaleAPIPage as any,
    ...components,
  };
}
