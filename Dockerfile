# syntax=docker/dockerfile:1

ARG ALPINE_MIRROR=https://mirror.arvancloud.ir/alpine

FROM node:24-alpine AS base

ARG ALPINE_MIRROR
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN sed -i "s|https://dl-cdn.alpinelinux.org/alpine|${ALPINE_MIRROR}|g" /etc/apk/repositories

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS development

COPY --chown=node:node . .
RUN mkdir -p .next && chown node:node .next

ENV NODE_ENV=development

USER node

CMD ["npm", "run", "dev"]

FROM base AS builder
# The canonical API, as an origin (https://api.<base>) or with the /api suffix.
ARG VENDRA_API_URL
# Optional fleet-wide storage override. Left empty, the API origin applies.
ARG STORAGE_BASE_URL
# Browser-side and fleet-wide, so safe to bake in. There is deliberately no
# NEXT_PUBLIC_ API or storage URL: NEXT_PUBLIC_* is inlined at build time, so
# one would freeze a single tenant's host into the shared image. The browser
# never needs them — reads go through same-origin /api/proxy and /api/storage.
ARG NEXT_PUBLIC_MAP_PROVIDER
ARG NEXT_PUBLIC_NESHAN_MAP_KEY
ARG NEXT_PUBLIC_NESHAN_MAP_TYPE

ENV VENDRA_API_URL=$VENDRA_API_URL
ENV STORAGE_BASE_URL=$STORAGE_BASE_URL
ENV NEXT_PUBLIC_MAP_PROVIDER=$NEXT_PUBLIC_MAP_PROVIDER
ENV NEXT_PUBLIC_NESHAN_MAP_KEY=$NEXT_PUBLIC_NESHAN_MAP_KEY
ENV NEXT_PUBLIC_NESHAN_MAP_TYPE=$NEXT_PUBLIC_NESHAN_MAP_TYPE

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
RUN apk add --no-cache ca-certificates \
  && addgroup -S nextjs \
  && adduser -S nextjs -G nextjs

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS=--use-system-ca

# Every property runs this same image. Its base64-encoded JSON configuration and
# server-side API origin are supplied by the deployment at container startup.
ARG VENDRA_API_URL
ENV VENDRA_API_URL=$VENDRA_API_URL

COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
