import { z } from "zod";

export const contactSchema = z.object({
  email: z.string().email("Valid email address is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.unknown()).default({}),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const bulkContactSchema = z.object({
  contacts: z.array(contactSchema).min(1, "At least 1 contact must be provided"),
  tagsToApply: z.array(z.string()).default([]),
  scrubSuppression: z.boolean().default(true),
});

export type BulkContactInput = z.infer<typeof bulkContactSchema>;
