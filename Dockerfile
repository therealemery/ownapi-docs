# Ownapi docs — self-hosted Next.js image for Lightsail.
# Build happens in GitHub Actions only; never build this on the server.
# Runs `next start` (not Output File Tracing standalone) so that middleware,
# redirects, rewrites and the route handlers behave exactly as in `next dev`.

FROM node:24-slim AS builder

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# git is required: source.config.ts uses `lastModifiedTime: 'git'`
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# bun is the lockfile owner (bun.lock). Install it as a package manager only;
# the build itself runs on node via `bun run build` -> `node ... && next build`.
RUN npm install -g bun@1.3.14

WORKDIR /app

# Whole tree (including .git) is copied first: `postinstall` runs fumadocs-mdx,
# which needs source.config.ts and content/ to exist. Layer caching is traded
# for build correctness here.
COPY . .

ARG SITE_URL=https://docs.ownapi.dev
ARG NEXT_PUBLIC_GA_ID=
ENV SITE_URL=${SITE_URL} \
    NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}

RUN bun install --frozen-lockfile \
 && bun run build


FROM node:24-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown -R node:node /app

# Runtime secrets (INKEEP_API_KEY etc.) are NOT baked into the image; they are
# injected by compose at container start.
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/next.config.mjs ./next.config.mjs
COPY --chown=node:node --from=builder /app/hidden-docs.mjs ./hidden-docs.mjs
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/content ./content

USER node

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
