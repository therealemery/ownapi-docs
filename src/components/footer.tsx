import { OfficialSites } from '@/components/official-sites';

interface FooterProps {
  lang: string;
}

const copyright: Record<string, string> = {
  zh: '© 2026 Ownapi. All Rights Reserved.',
  en: '© 2026 Ownapi. All Rights Reserved.',
  ja: '© 2026 Ownapi. All Rights Reserved.',
};

export function Footer({ lang }: FooterProps) {
  return (
    <footer className="border-fd-border bg-fd-card/30 mt-auto border-t backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <OfficialSites lang={lang} />
        <p className="text-fd-muted-foreground mt-6 border-t pt-6 text-xs">
          {copyright[lang] || copyright.en}
        </p>
      </div>
    </footer>
  );
}
