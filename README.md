# WinLog

WinLog is a local-first browser extension for capturing work-achievement evidence and drafting user-approved achievements, with an optional resume-builder web app.

## Requirements

- Node.js 22
- pnpm 9.12.3 (Corepack reads the pinned version from `package.json`)

## Development

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dlx supabase@2.119.0 start
```

Run each app in a separate terminal after Supabase starts:

```sh
pnpm --filter web dev
pnpm --filter extension dev
```

The extension dev command opens the unpacked Chromium build for local testing.
Stop the local Supabase stack with `pnpm dlx supabase@2.119.0 stop` when done.
Docker must be installed and running for Supabase local development.

Run the checks used in CI:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm check:boundaries
pnpm --filter extension zip
```

## Deployment

Pushes to `main` deploy the web app to the staging Supabase and Vercel projects.
Production runs only after staging succeeds and requires approval through the
GitHub `production` environment. See `INFRASTRUCTURE_SPEC.md` for project setup,
environment secrets, and OAuth redirect configuration.

The extension zip is written under `apps/extension/.output/`. The web app can be started with `pnpm --filter web dev`.

Cross-boundary data schemas belong in `packages/core`. Raw evidence is device-local: content scripts must not make network requests, and sync or web code must not import local evidence modules.
