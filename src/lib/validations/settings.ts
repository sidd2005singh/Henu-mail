import { z } from "zod";

export const systemSettingsSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  platformName: z.string().min(2, "Platform name is required"),
  supportEmail: z.string().email("Valid support email is required"),
  privacyPolicyUrl: z.string().min(1, "Privacy policy URL is required"),
  termsUrl: z.string().min(1, "Terms URL is required"),
  emailPolicyUrl: z.string().min(1, "Email policy URL is required"),
  defaultDailyLimit: z.number().int().min(10).max(10000),
  warmupDefaultIncrement: z.number().int().min(1).max(50),
  customBranding: z.object({
    primaryColor: z.string().optional(),
    logoUrl: z.string().optional(),
    footerNote: z.string().optional(),
  }).default({}),
});

export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
