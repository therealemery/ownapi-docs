/** @typedef {string[] | undefined} DocSlug */

export const publicSiteLanguages = ['en', 'zh', 'ja'];

/**
 * Doc slugs (under `/{lang}/docs/`) hidden on the public Ownapi API usage site.
 * Keep in sync with middleware / next.config redirects.
 */
export const hiddenDocSlugPrefixPaths = [
  'installation',
  'guide',
  'plugins',
  'skills',
  'business',
  'apps',
  'support',
  'api/management',
];

/**
 * @param {DocSlug} slug
 */
export function isHiddenDocSlug(slug) {
  if (!slug?.length) return false;
  const path = slug.join('/');
  return hiddenDocSlugPrefixPaths.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

/**
 * @param {string} pathname
 */
export function hasLocalePrefix(pathname) {
  return /^\/(en|zh|ja)(\/|$)/.test(pathname);
}

/** Build-time redirects (also applied on the edge without running doc SSR). */
export function buildHiddenDocRedirects() {
  /** @type {import('next/dist/lib/load-custom-routes').Redirect[]} */
  const redirects = [];

  for (const lang of publicSiteLanguages) {
    redirects.push(
      {
        source: `/${lang}/plugins`,
        destination: `/${lang}/docs`,
        permanent: false,
      },
      {
        source: `/${lang}/plugins/:path*`,
        destination: `/${lang}/docs`,
        permanent: false,
      }
    );

    for (const prefix of hiddenDocSlugPrefixPaths) {
      redirects.push(
        {
          source: `/${lang}/docs/${prefix}`,
          destination: `/${lang}/docs`,
          permanent: false,
        },
        {
          source: `/${lang}/docs/${prefix}/:path*`,
          destination: `/${lang}/docs`,
          permanent: false,
        }
      );
    }
  }

  return redirects;
}
