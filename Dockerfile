FROM node:26.13.1-alpine3.23 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

FROM caddy:2.10.2-alpine AS runtime

RUN addgroup -S -g 10001 app \
  && adduser -S -D -H -u 10001 -G app app \
  && mkdir -p /config/caddy /data/caddy /srv \
  && chown -R app:app /config /data /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --chown=app:app --from=build /app/dist /srv

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1
