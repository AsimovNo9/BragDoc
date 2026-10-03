import { z } from "zod";

const RevisionSchema = z.number().int().nonnegative();
const ChangeMetadataSchema = z.object({
  id: z.string().uuid(),
  baseRev: RevisionSchema.nullable(),
});

export const ApprovedAchievementSchema = z
  .object({
    body: z.string().min(1).max(600),
    skills: z.array(z.string()),
    occurredOn: z.string().date().nullable(),
    status: z.enum(["approved", "archived"]),
  })
  .strict();

export const ResumeSyncSchema = z
  .object({
    title: z.string().min(1).max(200),
    templateId: z.string().nullable(),
    content: z.record(z.string(), z.unknown()),
  })
  .strict();

export const CoverLetterSyncSchema = z
  .object({
    jobTitle: z.string().max(200).nullable(),
    company: z.string().max(200).nullable(),
    body: z.string().min(1),
  })
  .strict();

function syncChangeSchema<T extends z.ZodType>(entity: string, data: T) {
  return z.discriminatedUnion("op", [
    ChangeMetadataSchema.extend({
      entity: z.literal(entity),
      op: z.literal("upsert"),
      data,
    }).strict(),
    ChangeMetadataSchema.extend({
      entity: z.literal(entity),
      op: z.literal("delete"),
    }).strict(),
  ]);
}

export const SyncChangeSchema = z.union([
  syncChangeSchema("achievement", ApprovedAchievementSchema),
  syncChangeSchema("resume", ResumeSyncSchema),
  syncChangeSchema("coverLetter", CoverLetterSyncSchema),
]);

export const SyncPushRequestSchema = z
  .object({
    deviceId: z.string().uuid(),
    items: z.array(SyncChangeSchema).max(100),
  })
  .strict();

export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
