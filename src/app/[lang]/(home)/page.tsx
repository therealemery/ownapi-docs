import Link from 'next/link';
import { Hero } from './page.client';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { createPageMetadata, siteMetadata, baseUrl } from '@/lib/metadata';
import { OfficialSites } from '@/components/official-sites';
import { getLocalePath, i18n } from '@/lib/i18n';
import { productName, productSiteUrl } from '@/lib/brand';

const contentMap = {
  en: {
    badge: 'Hosted AI gateway',
    title: 'Call the Ownapi API at',
    highlight: 'ownapi.dev',
    description:
      'Bearer authentication, OpenAI-compatible chat/completions, model listing, and client setup—no self-hosting required.',
    getStarted: 'API guide',
    browseTitle: 'Documentation',
    browseDescription: 'Everything you need to integrate as an API consumer.',
    allDocs: 'Open docs',
    topics: [
      ['Quick start', 'Base URL, auth, and your first chat completion request.'],
      ['API reference', 'Endpoints, parameters, and interactive reference pages.'],
      ['AI applications', 'Wire up Cherry Studio, Cursor, LangBot, and more.'],
      ['Help & support', 'FAQ and troubleshooting.'],
    ],
  },
  zh: {
    badge: '托管 AI 网关',
    title: '在',
    highlight: 'ownapi.dev',
    titleSuffix: '调用 Ownapi API',
    description:
      'Bearer 鉴权、OpenAI 兼容 Chat/Completions、模型列表与客户端接入——无需自建网关。',
    getStarted: '阅读 API 指南',
    browseTitle: '文档导航',
    browseDescription: '面向 API 使用者的接入说明与参考。',
    allDocs: '进入文档',
    topics: [
      ['快速开始', 'Base URL、鉴权与第一次 Chat 请求。'],
      ['API 参考', '接口参数与在线参考页。'],
      ['AI 应用接入', 'Cherry Studio、Cursor、LangBot 等客户端配置。'],
      ['帮助支持', '常见问题与排查。'],
    ],
  },
  ja: {
    badge: 'ホスト型 AI ゲートウェイ',
    title: '',
    highlight: 'ownapi.dev',
    titleSuffix: 'で Ownapi API を呼び出す',
    description:
      'Bearer 認証、OpenAI 互換 Chat/Completions、モデル一覧、クライアント設定。セルフホスト不要。',
    getStarted: 'API ガイド',
    browseTitle: 'ドキュメント',
    browseDescription: 'API 利用者向けの接続ガイドとリファレンス。',
    allDocs: 'ドキュメントを開く',
    topics: [
      ['クイックスタート', 'Base URL、認証、最初の Chat リクエスト。'],
      ['API リファレンス', 'エンドポイントとパラメーター。'],
      ['AI アプリ連携', 'Cherry Studio、Cursor、LangBot など。'],
      ['ヘルプとサポート', 'FAQ とトラブルシューティング。'],
    ],
  },
};

const topicRoutes = [
  { path: 'docs', icon: BookOpen },
  { path: 'docs/api', icon: Code2 },
  { path: 'docs/apps', icon: Sparkles },
  { path: 'docs/support', icon: Headphones },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const text = siteMetadata[lang] || siteMetadata.en;
  return {
    ...createPageMetadata({
      lang,
      title: text.title,
      description: text.description,
    }),
    title: { absolute: text.title },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const content = contentMap[lang as keyof typeof contentMap] || contentMap.en;
  const canonicalUrl = new URL(getLocalePath(lang), baseUrl).href;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl.origin}/#website`,
        url: baseUrl.origin,
        name: 'Ownapi Documentation',
        inLanguage: i18n.languages,
      },
      {
        '@type': 'CollectionPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: siteMetadata[lang]?.title || siteMetadata.en.title,
        description: content.description,
        inLanguage: lang,
        isPartOf: { '@id': `${baseUrl.origin}/#website` },
        about: {
          '@type': 'WebApplication',
          name: 'Ownapi',
          url: productSiteUrl,
        },
      },
    ],
  };

  const heroTitle =
    lang === 'zh' ? (
      <>
        {content.title}{' '}
        <span className="text-brand">{content.highlight}</span>{' '}
        {(content as (typeof contentMap)['zh']).titleSuffix}
      </>
    ) : lang === 'en' ? (
      <>
        {content.title}{' '}
        <span className="text-brand">{content.highlight}</span>.
      </>
    ) : (
      <>
        <span className="text-brand">{content.highlight}</span>{' '}
        {(content as (typeof contentMap)['ja']).titleSuffix}
      </>
    );

  return (
    <div
      id="home-content"
      className="text-fd-foreground mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16 sm:px-6 lg:px-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <div
        aria-labelledby="home-title"
        className="text-landing-foreground relative mx-auto flex min-h-[clamp(480px,60vh,720px)] w-full max-w-[1400px] overflow-hidden rounded-2xl border bg-origin-border"
      >
        <Hero>
          <p className="border-brand/50 text-brand w-fit rounded-full border p-2 text-xs font-medium">
            {content.badge}
          </p>
          <h1
            id="home-title"
            className="leading-tighter my-8 text-4xl font-medium text-balance xl:mb-12 xl:text-5xl"
          >
            {heroTitle}
          </h1>
          <p className="text-fd-muted-foreground mb-8 max-w-2xl text-lg leading-relaxed">
            {content.description}
          </p>
          <div className="flex w-fit flex-row flex-wrap items-center justify-center gap-4">
            <Link
              href={getLocalePath(lang, 'docs')}
              className="bg-brand text-brand-foreground hover:bg-brand-200 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-medium tracking-tight transition-colors max-sm:text-sm"
            >
              <BookOpen className="size-4" />
              {content.getStarted}
            </Link>
            <a
              href={productSiteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-medium tracking-tight transition-colors max-sm:text-sm"
            >
              {lang === 'zh' ? '打开控制台' : lang === 'ja' ? 'コンソール' : 'Open console'}
            </a>
          </div>
        </Hero>
      </div>

      <div className="bg-fd-card/40 mt-5 rounded-2xl border px-6 py-5 backdrop-blur-sm">
        <OfficialSites lang={lang} />
      </div>

      <section aria-labelledby="browse-title" className="mt-12 sm:mt-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="browse-title"
              className="text-2xl font-semibold tracking-tight"
            >
              {content.browseTitle}
            </h2>
            <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
              {content.browseDescription}
            </p>
          </div>
          <Link
            href={getLocalePath(lang, 'docs')}
            className="text-brand inline-flex items-center gap-2 text-sm font-medium"
          >
            {content.allDocs}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topicRoutes.map(({ path, icon: Icon }, index) => (
            <Link
              key={path}
              href={getLocalePath(lang, path)}
              className="group bg-fd-card hover:border-brand/50 hover:bg-brand/5 rounded-2xl border p-6 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Icon className="text-brand size-5" aria-hidden />
                <ArrowRight
                  className="text-fd-muted-foreground/50 group-hover:text-brand size-4"
                  aria-hidden
                />
              </div>
              <h3 className="mt-5 font-semibold">{content.topics[index][0]}</h3>
              <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
                {content.topics[index][1]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
