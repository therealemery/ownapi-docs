import { expect, test } from '@playwright/test';

const locales = ['en', 'zh', 'ja'] as const;

for (const lang of locales) {
  test(`${lang}: apps and support doc paths redirect to docs home`, async ({
    request,
  }) => {
    for (const section of ['apps', 'support'] as const) {
      for (const path of [
        `/${lang}/docs/${section}`,
        `/${lang}/docs/${section}/faq`,
        `/${lang}/docs/${section}/community-interaction`,
      ]) {
        const response = await request.get(path, { maxRedirects: 0 });
        expect(response.status(), path).toBe(307);
        expect(response.headers().location, path).toBe(`/${lang}/docs`);
      }
    }
  });
}
