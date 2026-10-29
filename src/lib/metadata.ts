import type { Metadata } from 'next';
import { docsSiteUrl } from '@/lib/brand';
import { getLocalePath, i18n } from './i18n';

// Set SITE_URL at build time to choose a different canonical documentation domain.
export function resolveSiteUrl(value = docsSiteUrl): URL {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error(
      `SITE_URL must be an absolute HTTP(S) origin, e.g. ${docsSiteUrl}`
    );
  }
  return url;
}

export const baseUrl = resolveSiteUrl(process.env.SITE_URL || undefined);

export const siteMetadata: Record<
  string,
  { title: string; description: string }
> = {
  en: {
    title: 'Ownapi Documentation',
    description:
      'Call the Ownapi hosted gateway at ownapi.dev: Bearer auth, OpenAI-compatible chat/completions, models, and client integration guides.',
  },
  zh: {
    title: 'Ownapi 文档',
    description:
      'Ownapi 托管网关（ownapi.dev）API 使用文档：鉴权、OpenAI 兼容 Chat/Completions、模型列表与客户端接入示例。',
  },
  ja: {
    title: 'Ownapi ドキュメント',
    description:
      'Ownapi ホスト型ゲートウェイ（ownapi.dev）の API 利用ガイド：Bearer 認証、OpenAI 互換 Chat/Completions、モデル一覧、クライアント連携。',
  },
};

const ogLocales: Record<string, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
};

export function getLanguageAlternates(
  path: string,
  languages: string[] = i18n.languages
) {
  const alternates: Record<string, string> = {};
  for (const lang of languages) {
    alternates[lang] = new URL(getLocalePath(lang, path), baseUrl).href;
  }
  const defaultLang = languages.includes(i18n.defaultLanguage)
    ? i18n.defaultLanguage
    : languages[0];
  if (defaultLang) alternates['x-default'] = alternates[defaultLang];
  return alternates;
}

export function createPageMetadata({
  lang,
  path = '',
  title,
  description,
  languages = i18n.languages,
  image,
}: {
  lang: string;
  path?: string;
  title: string;
  description?: string;
  languages?: string[];
  image?: string;
}): Metadata {
  const url = new URL(getLocalePath(lang, path), baseUrl).href;
  return createMetadata({
    title,
    description,
    alternates: {
      canonical: url,
      languages: getLanguageAlternates(path, languages),
    },
    openGraph: {
      url,
      locale: ogLocales[lang],
      alternateLocale: languages
        .filter((item) => item !== lang)
        .map((item) => ogLocales[item]),
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    ...(image
      ? { twitter: { card: 'summary_large_image', images: image } }
      : {}),
  });
}

export function createMetadata(override: Metadata): Metadata {
  return {
    metadataBase: baseUrl,
    ...override,
    // favicon.ico has no margin, for browser tabs; the PNGs keep one because Google shows the
    // largest icon cropped to a circle. No SVG icon: browsers would pick it for tabs too.
    // Icons live under /assets/ (or are favicon.ico) so the i18n middleware leaves them alone.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: { url: '/assets/apple-touch-icon.png', sizes: '180x180' },
    },
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/assets/logo.png',
      siteName: 'Ownapi Documentation',
      type: 'website',
      ...override.openGraph,
    },
    twitter: {
      card: 'summary',
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/assets/logo.png',
      ...override.twitter,
    },
  };
}
