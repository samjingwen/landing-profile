# syntax=docker/dockerfile:1

FROM caddy:2.11.9-builder-alpine@sha256:646fee578e680989ca5c7fd1ce6f1de574d19fd71ef2221810cc0510a9f40c86 AS caddy-build

WORKDIR /build

# xcaddy adds CAP_NET_BIND_SERVICE, but this image only listens on unprivileged port 8080.
RUN xcaddy build 0d98caea58f794f88e709b1bef2880996a471bca \
  --output /build/caddy \
  --replace golang.org/x/net=golang.org/x/net@v0.62.0 \
  && setcap -r /build/caddy \
  && capabilities="$(getcap /build/caddy)" \
  && test -z "$capabilities"

FROM node:26.13.1-alpine3.23@sha256:39d8c143e60e99ae98f014bebea1e72fc96d3c9bdf9504bc3a27af5c05bfa39f AS build

WORKDIR /app

COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY --link . .
RUN npm run build

FROM caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0 AS runtime

WORKDIR /srv

ARG VCS_REF=unknown

LABEL org.opencontainers.image.source="https://github.com/samjingwen/landing-profile" \
  org.opencontainers.image.title="Sam Jing Wen" \
  org.opencontainers.image.description="Sam Jing Wen's personal landing page" \
  org.opencontainers.image.revision="$VCS_REF"

RUN rm -f /usr/bin/caddy \
  && addgroup -S -g 10001 app \
  && adduser -S -D -H -u 10001 -G app app \
  && mkdir -p /config/caddy /data/caddy /srv \
  && chown -R 10001:10001 /config /data /srv

COPY --link --from=caddy-build /build/caddy /usr/local/bin/caddy
COPY --link --chown=10001:10001 Caddyfile /etc/caddy/Caddyfile
COPY --link --chown=10001:10001 --from=build /app/dist /srv

USER 10001:10001
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["/usr/local/bin/caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
