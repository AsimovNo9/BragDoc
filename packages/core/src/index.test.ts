import assert from "node:assert/strict";
import test from "node:test";
import { SyncPushRequestSchema } from "./index.js";

const validRequest = {
  deviceId: "00000000-0000-4000-8000-000000000001",
  items: [
    {
      entity: "achievement",
      id: "00000000-0000-4000-8000-000000000002",
      op: "upsert",
      baseRev: null,
      data: {
        body: "Reduced deployment time by 20%.",
        skills: ["delivery"],
        occurredOn: "2026-10-02",
        status: "approved",
      },
    },
  ],
};

test("accepts approved achievement sync payloads", () => {
  assert.equal(SyncPushRequestSchema.safeParse(validRequest).success, true);
});

test("rejects drafts and evidence fields at the sync boundary", () => {
  const withEvidence = {
    ...validRequest,
    items: [
      {
        ...validRequest.items[0],
        data: {
          ...validRequest.items[0].data,
          status: "draft",
          sourceUrl: "https://work.example/message/1",
        },
      },
    ],
  };

  assert.equal(SyncPushRequestSchema.safeParse(withEvidence).success, false);
});

test("rejects unapproved entity types and oversized batches", () => {
  const evidenceEntity = structuredClone(validRequest);
  evidenceEntity.items[0].entity = "evidence";
  assert.equal(SyncPushRequestSchema.safeParse(evidenceEntity).success, false);

  const oversized = { ...validRequest, items: Array.from({ length: 101 }, () => validRequest.items[0]) };
  assert.equal(SyncPushRequestSchema.safeParse(oversized).success, false);
});

test("requires data for upserts and permits payload-free deletes", () => {
  const upsert = validRequest.items[0];
  const missingData = {
    ...validRequest,
    items: [{ entity: upsert.entity, id: upsert.id, op: upsert.op, baseRev: upsert.baseRev }],
  };
  const deleteRequest = {
    ...validRequest,
    items: [{ entity: "achievement", id: upsert.id, op: "delete", baseRev: 1 }],
  };

  assert.equal(SyncPushRequestSchema.safeParse(missingData).success, false);
  assert.equal(SyncPushRequestSchema.safeParse(deleteRequest).success, true);
});
