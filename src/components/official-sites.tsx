import { ArrowUpRight } from 'lucide-react';
import { productName, productSiteUrl } from '@/lib/brand';

const labels: Record<string, { title: string; link: string }> = {
  zh: { title: '使用托管网关与控制台', link: `${productName} 控制台` },
  en: { title: 'Hosted gateway and console', link: `${productName} console` },
  ja: {
    title: 'ホスト型ゲートウェイとコンソール',
    link: `${productName} コンソール`,
  },
};

export function OfficialSites({ lang }: { lang: string }) {
  const text = labels[lang] || labels.en;
  return (
    <nav
      aria-label={text.link}
      className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between"
    >
      <p className="text-fd-muted-foreground text-sm">{text.title}</p>
      <a
        href={productSiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-fd-foreground hover:text-brand inline-flex flex-wrap items-center gap-1.5 text-sm font-medium transition-colors"
      >
        {text.link}
        <span className="text-fd-muted-foreground font-normal">
          {new URL(productSiteUrl).host}
        </span>
        <ArrowUpRight className="size-3.5" aria-hidden />
      </a>
    </nav>
  );
}
