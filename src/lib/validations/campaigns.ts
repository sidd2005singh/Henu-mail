import { z } from "zod";

export const campaignStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  delayHours: z.number().int().min(0).default(24),
  templateId: z.string().uuid().optional(),
  subject: z.string().min(1, "Subject is required"),
  bodyHtml: z.string().min(1, "Body HTML is required"),
});

export const campaignCreateSchema = z.object({
  name: z.string().min(2, "Campaign name is required (min 2 characters)"),
  description: z.string().optional(),
  segmentId: z.string().uuid().optional(),
  assignedEmailAccountIds: z.array(z.string().uuid()).min(1, "Select at least 1 sending account"),
  steps: z.array(campaignStepSchema).min(1, "At least 1 sequence step is required"),
  scheduleConfig: z.object({
    timezone: z.string().default("UTC"),
    days: z.array(z.string()).default(["Mon", "Tue", "Wed", "Thu", "Fri"]),
    hours: z.object({
      start: z.number().min(0).max(23).default(9),
      end: z.number().min(0).max(23).default(17),
    }),
  }),
  stopOnReply: z.boolean().default(true),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
