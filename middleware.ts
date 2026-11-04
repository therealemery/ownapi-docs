import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { i18n } from '@/lib/i18n';

const i18nMiddleware = createI18nMiddleware(i18n);

/**
 * Locale detection + default-language redirects only for paths without a
 * leading `/en|zh|ja` segment. Localized doc URLs are pre-rendered at build
 * time and should not pay i18n middleware cost on Workers.
 */
export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  return i18nMiddleware(request, event);
}

export const config = {
  matcher: [
    '/',
    /*
     * Exclude localized app routes (`/en`, `/zh`, `/ja`, and their children).
     * Hidden self-host doc paths under those locales use `redirects()` in
     * next.config.mjs instead of middleware.
     */
    '/((?!en(?:/|$)|zh(?:/|$)|ja(?:/|$)|api|og/|_next/static|_next/image|favicon.ico|assets/|robots\\.txt|sitemap\\.xml|llms?\\.txt|llm-full\\.txt|llms-full\\.txt).*)',
  ],
};
