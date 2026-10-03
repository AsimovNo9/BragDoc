# Repository rules

1. Never import local evidence modules from `apps/extension/src/sync/` or `apps/web/`.
2. Define cross-boundary payloads with Zod schemas in `packages/core`.
3. Do not make network requests from extension content scripts; route network access through extension contexts that own it.
4. Keep raw work content and source links on the device; cloud sync is limited to user-approved data.
5. Schema changes require a new SQL migration, RLS policy, and pgTAP test in the same change.
6. Do not add extension permissions without documenting the need and reviewing the privacy impact.
7. Telemetry must not include message text, source-message URLs, or job-page text.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
