# Sam Jing Wen

[![CI](https://github.com/samjingwen/landing-profile/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/samjingwen/landing-profile/actions/workflows/ci.yml)

A focused personal landing page for Sam Jing Wen.

Visit the live site at [samjingwen.io](https://samjingwen.io).

## About

The site presents a concise identity, portrait, and set of professional destinations without unnecessary sections or framework overhead.
Its "Centered Signal" design uses editorial typography, a Tokyo Night-inspired palette, tactile controls, and a restrained interactive particle field.

The experience is designed to remain:

- Fast and responsive across desktop and mobile viewports.
- Keyboard accessible with clearly named icon links.
- Usable when the decorative canvas is unavailable.
- Stable under image loading, zoom, and short viewport conditions.

## Stack

- Vite and TypeScript without a component framework.
- Caddy serving the production static artifact on unprivileged port `8080`.
- Vitest for unit tests.
- Playwright and axe-core for browser and accessibility checks.
- Docker Buildx for reproducible ARM64 container builds.

## Local development

Use Node.js 26 and npm.

```bash
npm ci
npm run dev
```

The development server listens on `http://127.0.0.1:5173`.

Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Validation

Install the Playwright browser once, then run the complete validation suite:

```bash
npx playwright install chromium
npm run check
```

The complete suite runs formatting, linting, unit tests, a production build, browser tests, responsive checks, and automated accessibility checks.

## Container

Build and run the production container locally with Docker Compose:

```bash
docker compose up --build
```

The service is exposed only on `http://127.0.0.1:8080`.

The production image:

- Runs as UID and GID `10001`.
- Listens on an unprivileged port.
- Has no required Linux capabilities.
- Supports a read-only root filesystem with dedicated temporary runtime mounts.
- Uses digest-pinned build and runtime base images.

## Runtime endpoints

- `/healthz` returns a minimal health response.
- `/version.json` reports only the public Git revision embedded during the build and is served with `Cache-Control: no-store`.

## Continuous delivery

Pull requests run the quality suite and an ARM64 container smoke test.
Successful merges to protected `master` publish an immutable approved image only after provenance, SBOM, vulnerability, and hardened-runtime checks pass.
Production reconciliation is pull-based, and the workflow verifies the deployed public revision without receiving cluster credentials.

## Repository structure

```text
src/                 Application source and public assets
tests/               Unit and browser tests
scripts/             Container and deployment verification scripts
Dockerfile           Hardened multi-stage production image
Caddyfile             Static serving, caching, and health behavior
DESIGN.md             Visual system and interaction rules
PRODUCT.md            Product purpose and constraints
.github/workflows/    Continuous integration and delivery checks
```
