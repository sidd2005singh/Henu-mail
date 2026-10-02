import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validations/auth";
import { systemSettingsSchema } from "@/lib/validations/settings";
import { campaignCreateSchema } from "@/lib/validations/campaigns";
import { contactSchema } from "@/lib/validations/contacts";

describe("HENU MAIL Schema Validations", () => {
  it("Validates authentication inputs correctly", () => {
    const valid = loginSchema.safeParse({
      email: "admin@henuos.com",
      password: "strongPassword123",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: "not-an-email",
      password: "strongPassword123",
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = loginSchema.safeParse({
      email: "admin@henuos.com",
      password: "123",
    });
    expect(shortPassword.success).toBe(false);
  });

  it("Validates system settings and owner branding", () => {
    const validSettings = systemSettingsSchema.safeParse({
      companyName: "HENU OS Private Limited",
      platformName: "HENU MAIL",
      supportEmail: "support@henuos.com",
      privacyPolicyUrl: "/privacy",
      termsUrl: "/terms",
      emailPolicyUrl: "/email-policy",
      defaultDailyLimit: 200,
      warmupDefaultIncrement: 5,
    });
    expect(validSettings.success).toBe(true);
  });

  it("Validates contact schema with RFC email validation", () => {
    const validContact = contactSchema.safeParse({
      email: "founder@startup.io",
      firstName: "Alex",
      lastName: "Rider",
      company: "Startup Co",
      tags: ["AI", "Founder"],
    });
    expect(validContact.success).toBe(true);
  });
});
