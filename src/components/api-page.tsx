import { createAPIPage } from 'fumadocs-openapi/ui';
import { getOpenapiForLang } from '@/lib/openapi';
import type { FC } from 'react';
import client from './api-page.client';

const apiPageByLang = new Map<string, FC<any>>();

export function getAPIPageForLang(lang: string): FC<any> {
  let page = apiPageByLang.get(lang);
  if (!page) {
    page = createAPIPage(getOpenapiForLang(lang), { client }) as FC<any>;
    apiPageByLang.set(lang, page);
  }
  return page;
}

/** @deprecated Use getAPIPageForLang(lang) from MDX with the page locale. */
export const APIPage = getAPIPageForLang('en');
