import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, linkItems } from '@/lib/layout.shared';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';
import { Footer } from '@/components/footer';
import Link from 'fumadocs-core/link';
import {
  Rocket,
  HelpCircle,
  Sparkles,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { getLocalePath } from '@/lib/i18n';
import { productSiteUrl } from '@/lib/brand';

const NAV_ITEMS = [
  { key: 'start', icon: Rocket, path: '' },
  { key: 'api', icon: BookOpen, path: '/api' },
  { key: 'apps', icon: Sparkles, path: '/apps' },
  { key: 'support', icon: HelpCircle, path: '/support' },
] as const;

const i18nText: Record<
  string,
  Record<string, { text: string; desc: string }>
> = {
  en: {
    title: { text: 'Documentation', desc: '' },
    console: { text: 'Console', desc: '' },
    start: {
      text: 'Call the API',
      desc: 'Base URL, Bearer auth, and first request.',
    },
    support: { text: 'Help & Support', desc: 'FAQ and troubleshooting.' },
    api: {
      text: 'API Reference',
      desc: 'OpenAI-compatible endpoints on ownapi.dev.',
    },
    apps: {
      text: 'AI Applications',
      desc: 'Client integration guides.',
    },
  },
  zh: {
    title: { text: '文档', desc: '' },
    console: { text: '控制台', desc: '' },
    start: { text: '调用 API', desc: 'Base URL、鉴权与示例请求。' },
    support: { text: '帮助支持', desc: '常见问题与排查。' },
    api: { text: 'API 参考', desc: 'ownapi.dev 上的 OpenAI 兼容接口。' },
    apps: { text: 'AI 应用', desc: '客户端接入指南。' },
  },
  ja: {
    title: { text: 'ドキュメント', desc: '' },
    console: { text: 'コンソール', desc: '' },
    start: { text: 'API の呼び出し', desc: 'Base URL、Bearer 認証、サンプル。' },
    support: {
      text: 'ヘルプ＆サポート',
      desc: 'FAQ とトラブルシューティング。',
    },
    api: {
      text: 'API リファレンス',
      desc: 'ownapi.dev の OpenAI 互換 API。',
    },
    apps: {
      text: 'AI アプリケーション',
      desc: 'クライアント連携ガイド。',
    },
  },
};

const getTexts = (lang: string) => i18nText[lang] || i18nText.en;

const buildNavItems = (lang: string, docsUrl: string) => {
  const texts = getTexts(lang);
  return NAV_ITEMS.map(({ key, icon: Icon, path }) => ({
    text: texts[key].text,
    desc: texts[key].desc,
    url: `${docsUrl}${path}`,
    Icon,
  }));
};

function MenuLinkItem({
  item,
  className,
}: {
  item: { text: string; desc: string; url: string; Icon: LucideIcon };
  className?: string;
}) {
  const { Icon, text, desc, url } = item;
  return (
    <NavbarMenuLink href={url} className={className}>
      <Icon className="bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1" />
      <p className="font-medium">{text}</p>
      <p className="text-fd-muted-foreground text-sm">{desc}</p>
    </NavbarMenuLink>
  );
}

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const texts = getTexts(lang);
  const docsUrl = getLocalePath(lang, 'docs');
  const navItems = buildNavItems(lang, docsUrl);

  return (
    <div className="flex min-h-screen flex-col">
      <HomeLayout
        {...baseOptions(lang)}
        links={[
          {
            type: 'menu',
            on: 'menu',
            text: texts.title.text,
            items: navItems.map(({ text, url, Icon }) => ({
              text,
              url,
              icon: <Icon />,
            })),
          },
          {
            type: 'main',
            on: 'menu',
            text: texts.console.text,
            url: productSiteUrl,
            external: true,
          },
          {
            type: 'custom',
            on: 'nav',
            children: (
              <NavbarMenu>
                <NavbarMenuTrigger>
                  <Link href={docsUrl}>{texts.title.text}</Link>
                </NavbarMenuTrigger>
                <NavbarMenuContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {navItems.map((item) => (
                    <MenuLinkItem key={item.url} item={item} />
                  ))}
                </NavbarMenuContent>
              </NavbarMenu>
            ),
          },
          {
            type: 'main',
            on: 'nav',
            text: texts.console.text,
            url: productSiteUrl,
            external: true,
          },
          ...linkItems,
        ]}
        className="flex-1 dark:bg-neutral-950 dark:[--color-fd-background:var(--color-neutral-950)]"
      >
        {children}
      </HomeLayout>
      <Footer lang={lang} />
    </div>
  );
}
