import { ArrowUpRight } from 'lucide-react';
import { productName, productSiteUrl } from '@/lib/brand';

const labels: Record<string, { title: string; link: string }> = {
  zh: { title: `了解 ${productName} 项目`, link: `${productName} 官网` },
  en: {
    title: `Explore the ${productName} project`,
    link: `${productName} website`,
  },
  ja: {
    title: `${productName} プロジェクト`,
    link: `${productName} 公式サイト`,
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
