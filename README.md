# ownapi-docs

A Next.js documentation site for [Ownapi](https://ownapi.dev) — an AI gateway and model API management system (forked from [New API](https://github.com/QuantumNous/new-api)).

## Development

Run the development server:

```bash
bun install

bun dev
```

Open http://localhost:3000 with your browser to see the result.

## Build

Build the application for production:

```bash
bun run build
```

For production deployments at **https://docs.ownapi.dev**, set the canonical origin before building:

```bash
SITE_URL=https://docs.ownapi.dev bun run build
```

Set the same variable in CI or on your host (for example Cloudflare Pages **Environment variables**). It must be a full HTTP(S) origin with no path, query, or fragment.

## Deploying to Cloudflare (docs.ownapi.dev)

Ownapi documentation is intended to run at `https://docs.ownapi.dev` via **OpenNext on Cloudflare Workers** (or Cloudflare’s Next.js adapter), not as a Docker container on the API/gateway server.

Recommended build settings:

| Setting | Value |
| -------- | ----- |
| Build command | `SITE_URL=https://docs.ownapi.dev bun run build` |
| Build output | Standard Next.js app (`.next` after `next build`) — OpenNext / `@opennextjs/cloudflare`, **not** `output: 'export'` (middleware + API routes remain) |
| Node.js | `24` (see `engines` in `package.json`) |
| `SITE_URL` | `https://docs.ownapi.dev` (build-time canonical origin) |

### Workers Free / Error 1102 (CPU limit)

Documentation under `/{lang}/docs/**` is **pre-rendered at build time** (`force-static` + `generateStaticParams`). Per-request work on doc pages should be limited to serving cached HTML/assets, not full SSR.

| Route class | Rendering |
| ----------- | --------- |
| `/{lang}`, `/{lang}/docs/**` | Static HTML (SSG at build) |
| `/` | Static redirect page + **middleware only when the path has no locale prefix** |
| Hidden self-host paths (`installation`, `guide`, `plugins`, …) | `next.config` **redirects** to `/{lang}/docs` (no doc page generated) |
| `/api/search`, `/api/chat`, `/api/plugins`, `/api/proxy` | Dynamic (only when invoked) |
| `/og/docs/**`, `*.txt` / `llms.mdx` exports | Mostly static; OG/LLM routes skip hidden doc slugs |

**Ops checklist after deploy**

1. Keep **incremental / R2 cache** enabled in OpenNext so cold doc hits serve prebuilt HTML instead of re-rendering MDX.
2. Verify a cold request: `curl -sI https://docs.ownapi.dev/zh/docs` — expect `200` without Cloudflare **1102**; repeat for a deep doc URL.
3. Verify hidden redirect: `curl -sI https://docs.ownapi.dev/zh/docs/installation` → `307/308` to `/zh/docs`.
4. Locale switcher links are static paths (`/en/docs`, `/zh/docs`, …); no change required in Wrangler unless you customize asset caching headers.

Notes:

- **Prebuild**: `prebuild` runs `scripts/prebuild.ts` (changelog from GitHub releases). Optional: `SOURCE_REPO=therealemery/new-api`, `GITHUB_TOKEN` for rate limits.
- **Middleware**: runs for `/` and non-localized paths only (locale detection). Localized doc URLs bypass middleware to reduce Workers CPU.
- **Optional features**: AI search UI is disabled in the docs layout; `/api/search` remains for Fumadocs search if re-enabled. `INKEEP_API_KEY`, `GITHUB_APP_*`, `NEXT_PUBLIC_GA_ID` are optional.

Preview builds should still set `SITE_URL` to the production docs origin if you want canonical URLs to point at `docs.ownapi.dev`.

## SEO and canonical domain

The canonical documentation origin defaults to `https://docs.ownapi.dev`, including local builds and preview deployments. Set `SITE_URL` **before building** only if you need a different canonical domain.

All page canonicals, language alternates, sharing metadata, structured data, `sitemap.xml`, and `robots.txt` use that origin.

SEO browser checks run against a production build:

```bash
bunx next build
bun run test:seo:browser
```

Use `PLUGIN_TEST_BROWSER_CHANNEL=chrome` for installed Chrome, as below.

## Plugin marketplace checks

```bash
bun run test:plugins
bunx next build # skips the changelog-writing prebuild hook
bunx playwright install chromium
bun run test:plugins:browser
```

Browser tests start the production server on port 3100 and mock catalog data.
To use an installed Chrome instead of downloading Chromium, run
`PLUGIN_TEST_BROWSER_CHANNEL=chrome bun run test:plugins:browser`.

The marketplace reads plugin catalog data from the product site (`ownapi.dev` by default, or legacy New API hosts when configured). Building the docs does not fetch the plugin catalog. Local previews use the Ownapi default.

## Project Structure

| Path                          | Description                  |
| ----------------------------- | ---------------------------- |
| `src/app/[lang]/(home)`       | Landing page and home pages  |
| `src/app/[lang]/docs`         | Documentation pages (i18n)   |
| `src/app/api/search/route.ts` | Search API endpoint          |
| `content/docs/`               | Documentation content (MDX)  |
| `src/lib/source.ts`           | Content source configuration |
| `src/lib/brand.ts`            | Ownapi product URLs and repos |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
