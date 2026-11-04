import { createOpenAPI } from 'fumadocs-openapi/server';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { productSiteUrl } from '@/lib/brand';
import { i18n } from '@/lib/i18n';

/** Canonical MDX document paths omit the locale segment (e.g. `openapi/generated/ai-model/...`). */
export const OPENAPI_GENERATED_ROOT = 'openapi/generated';

export type OpenApiSchemaLocale = 'zh' | 'en';

export function resolveOpenApiSchemaLocale(lang: string): OpenApiSchemaLocale {
  if (lang === 'zh') return 'zh';
  // No Japanese OpenAPI export yet — match translated MDX fallback (en).
  return 'en';
}

async function walkJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string) {
    let entries: Array<{ name: string; isDirectory: boolean; isFile: boolean }>;
    try {
      entries = (await readdir(current, { withFileTypes: true })) as any;
    } catch {
      return;
    }
    for (const e of entries as any) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.json')) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function toCanonicalDocumentKey(localeDir: string, absoluteJsonPath: string): string {
  const rel = path
    .relative(localeDir, absoluteJsonPath)
    .split(path.sep)
    .join('/');
  return `${OPENAPI_GENERATED_ROOT}/${rel}`;
}

async function loadOpenApiDocuments(
  schemaLocale: OpenApiSchemaLocale
): Promise<Record<string, Record<string, unknown>>> {
  const localeDir = path.join(process.cwd(), OPENAPI_GENERATED_ROOT, schemaLocale);
  const files = await walkJsonFiles(localeDir);
  if (files.length === 0) {
    throw new Error(
      `No OpenAPI files in ${OPENAPI_GENERATED_ROOT}/${schemaLocale}. Run: bun run generate:openapi`
    );
  }

  const entries = await Promise.all(
    files.map(async (absolutePath) => {
      const raw = await readFile(absolutePath, 'utf8');
      const doc = JSON.parse(raw) as Record<string, unknown>;
      if (
        !Array.isArray(doc.servers) ||
        (doc.servers as unknown[]).length === 0
      ) {
        doc.servers = [
          { url: productSiteUrl, description: 'Ownapi gateway' },
        ];
      }
      const key = toCanonicalDocumentKey(localeDir, absolutePath);
      return [key, doc] as const;
    })
  );

  return Object.fromEntries(entries);
}

const openApiBySchemaLocale = new Map<
  OpenApiSchemaLocale,
  ReturnType<typeof createOpenAPI>
>();

export function getOpenapiForLang(lang: string) {
  const schemaLocale = resolveOpenApiSchemaLocale(lang);
  let server = openApiBySchemaLocale.get(schemaLocale);
  if (!server) {
    server = createOpenAPI({
      proxyUrl: '/api/proxy',
      async input() {
        return loadOpenApiDocuments(schemaLocale);
      },
    });
    openApiBySchemaLocale.set(schemaLocale, server);
  }
  return server;
}

/** Default server (English) — used by API proxy and other non-doc callers. */
export const openapi = getOpenapiForLang(i18n.defaultLanguage);
