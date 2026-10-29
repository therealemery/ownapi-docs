import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '@/lib/i18n';

const i18nMiddleware = createI18nMiddleware(i18n);

/** Self-host / admin doc paths hidden from the public Ownapi API usage site. */
const HIDDEN_DOC_PREFIXES = [
  '/docs/installation',
  '/docs/guide',
  '/docs/plugins',
  '/docs/skills',
  '/docs/business',
  '/docs/api/management',
];

function redirectHiddenDocs(pathname: string, request: NextRequest) {
  for (const lang of i18n.languages) {
    if (pathname === `/${lang}/plugins` || pathname.startsWith(`/${lang}/plugins/`)) {
      return NextResponse.redirect(new URL(`/${lang}/docs`, request.url));
    }
    for (const prefix of HIDDEN_DOC_PREFIXES) {
      const base = `/${lang}${prefix}`;
      if (pathname === base || pathname.startsWith(`${base}/`)) {
        return NextResponse.redirect(new URL(`/${lang}/docs`, request.url));
      }
    }
  }
  return null;
}

export default function middleware(request: NextRequest) {
  const hidden = redirectHiddenDocs(request.nextUrl.pathname, request);
  if (hidden) return hidden;
  return i18nMiddleware(request);
}

export const config = {
  // Matcher ignoring API routes, Next.js internals, and static assets
  // Important: exclude metadata routes like `/robots.txt` and `/sitemap.xml`
  // so they won't be redirected to `/{lang}/...` which would 404 unless you implement localized metadata routes.
  matcher: [
    '/((?!api|og/|_next/static|_next/image|favicon.ico|assets/|robots\\.txt|sitemap\\.xml|llms?\\.txt|llm-full\\.txt|llms-full\\.txt).*)',
  ],
};
