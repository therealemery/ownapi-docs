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

## Deploying to Cloudflare Pages (docs.ownapi.dev)

Ownapi documentation is intended to run on **Cloudflare Pages** at `https://docs.ownapi.dev`, not as a Docker container on the API/gateway server.

Recommended Pages settings:

| Setting | Value |
| -------- | ----- |
| Build command | `bun run build` (or `npm run build`) |
| Build output | Standard Next.js app (`.next` after `next build`) — use Cloudflare’s **Next.js** / OpenNext adapter workflow, not a static `out/` export only |
| Node.js | `24` (see `engines` in `package.json`) |
| `SITE_URL` | `https://docs.ownapi.dev` (build-time; already the code default if unset) |

Notes:

- **Prebuild**: `prebuild` runs `scripts/prebuild.ts` (changelog from GitHub releases). Optional: `SOURCE_REPO=therealemery/new-api`, `GITHUB_TOKEN` for rate limits.
- **Runtime routes**: `/api/chat`, `/api/search`, `/api/plugins`, `/api/proxy`, OG images, and middleware need a Next-compatible edge/Workers runtime — pure static hosting is not enough.
- **Optional features**: `INKEEP_API_KEY` (AI search), `GITHUB_APP_ID` / `GITHUB_APP_PRIVATE_KEY` (docs feedback), `NEXT_PUBLIC_GA_ID` (analytics).

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
