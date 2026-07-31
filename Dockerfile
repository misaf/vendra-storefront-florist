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

FROM base AS builder
# Which properties/<slug>/ this image serves. Everything identifying the
# storefront — brand, contacts, socials, canonical origin — comes from that
# directory, so one image is one property.
ARG PROPERTY
# The canonical API, as an origin (https://api.<base>) or with the /api suffix.
ARG VENDRA_API_URL
ARG NEXT_PUBLIC_VENDRA_API_URL
# Optional overrides. Left empty, the property config decides.
ARG NEXT_PUBLIC_SITE_URL
ARG STORAGE_BASE_URL
ARG NEXT_PUBLIC_STORAGE_BASE_URL
ARG NEXT_PUBLIC_MAP_PROVIDER
ARG NEXT_PUBLIC_NESHAN_MAP_KEY
ARG NEXT_PUBLIC_NESHAN_MAP_TYPE

ENV PROPERTY=$PROPERTY
ENV VENDRA_API_URL=$VENDRA_API_URL
ENV NEXT_PUBLIC_VENDRA_API_URL=$NEXT_PUBLIC_VENDRA_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV STORAGE_BASE_URL=$STORAGE_BASE_URL
ENV NEXT_PUBLIC_STORAGE_BASE_URL=$NEXT_PUBLIC_STORAGE_BASE_URL
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

# Server-side values are read at runtime, so the property's own config applies
# unless the container overrides them. NEXT_PUBLIC_* values were inlined at
# build time and cannot be changed here.
ARG VENDRA_API_URL
ENV VENDRA_API_URL=$VENDRA_API_URL

COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
