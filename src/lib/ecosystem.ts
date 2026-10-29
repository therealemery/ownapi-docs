// Ecosystem projects promoted on the docs site.

import { productSiteUrl } from '@/lib/brand';

export const astrlinkRepoUrl = 'https://github.com/Calcium-Ion/AstrLink';
export const moejsRepoUrl = 'https://github.com/Calcium-Ion/moejs';

export function astrlinkUrl(lang: string): string {
  return lang === 'zh' ? 'https://astrlink.com/' : 'https://astrlink.com/en/';
}

export function privacyGatewayUrl(_lang: string): string {
  return productSiteUrl;
}
