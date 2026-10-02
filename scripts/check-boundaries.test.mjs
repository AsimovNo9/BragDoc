import assert from "node:assert/strict";
import test from "node:test";
import { inspectSource } from "./check-boundaries.mjs";

test("rejects direct and qualified network calls in content scripts", () => {
  const direct = inspectSource("apps/extension/entrypoints/slack.content.ts", "fetch('/collect');");
  const qualified = inspectSource("apps/extension/entrypoints/slack.content.ts", "window.fetch('/collect');");

  assert.equal(direct.length, 1);
  assert.equal(qualified.length, 1);
});

test("rejects imported network clients in content scripts", () => {
  const violations = inspectSource("apps/extension/entrypoints/slack.content.ts", "import ky from 'ky';");

  assert.equal(violations.length, 1);
});

test("does not mistake comments or string contents for network calls", () => {
  const violations = inspectSource(
    "apps/extension/entrypoints/slack.content.ts",
    "// fetch('/not-real')\nconst note = \"fetch('/not-real')\";",
  );

  assert.deepEqual(violations, []);
});

test("rejects evidence imports from sync and web code", () => {
  const sync = inspectSource("apps/extension/src/sync/push.ts", "import { readEvidence } from '../db/evidence-repository';");
  const web = inspectSource("apps/web/app/page.tsx", "export { readEvidence } from '@/evidence/store';");

  assert.equal(sync.length, 1);
  assert.equal(web.length, 1);
});

test("allows approved core schemas in sync and web code", () => {
  const violations = inspectSource("apps/extension/src/sync/push.ts", "import { SyncPushRequestSchema } from '@winlog/core';");

  assert.deepEqual(violations, []);
});
