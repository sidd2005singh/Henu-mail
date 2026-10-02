import { describe, it, expect } from "vitest";
import {
  interpolateTemplate,
  extractTemplateVariables,
} from "@/lib/templates/variable-interpolator";
import { analyzeTemplateDeliverability } from "@/lib/templates/deliverability-scorer";
import { generateHtmlFromBlocks } from "@/lib/templates/html-generator";
import { EmailBlock } from "@/lib/templates/block-types";

describe("HENU MAIL Template Studio & Deliverability Suite", () => {
  it("Extracts dynamic variables with and without fallback defaults", () => {
    const template = "Hi {{first_name | default: 'there'}}, we noticed {{company_name}} in {{city | default: 'your market'}}.";
    const vars = extractTemplateVariables(template);

    expect(vars.length).toBe(3);
    expect(vars[0].variableKey).toBe("first_name");
    expect(vars[0].defaultValue).toBe("there");
    expect(vars[1].variableKey).toBe("company_name");
    expect(vars[1].defaultValue).toBeUndefined();
    expect(vars[2].variableKey).toBe("city");
    expect(vars[2].defaultValue).toBe("your market");
  });

  it("Interpolates values correctly and applies fallbacks when contact data is missing", () => {
    const template = "Hello {{first_name | default: 'there'}}, scaling {{company_name | default: 'your company'}} in {{industry}}.";

    // Scenario A: Full context provided
    const renderedFull = interpolateTemplate(template, {
      first_name: "Vikram",
      company_name: "TechCorp India",
      industry: "AI Automation",
    });
    expect(renderedFull).toBe("Hello Vikram, scaling TechCorp India in AI Automation.");

    // Scenario B: Empty context -> Must use fallbacks and never leave awkward gaps
    const renderedEmpty = interpolateTemplate(template, {});
    expect(renderedEmpty).toBe("Hello there, scaling your company in your industry.");
    expect(renderedEmpty).not.toContain("Hello ,");
  });

  it("Analyzes deliverability and catches missing unsubscribe, short subjects, and spam keywords", () => {
    // Bad email scenario
    const badSubject = "100% FREE MAKE MONEY FAST";
    const badBody = "<p>Click here to win.</p>";
    const badScore = analyzeTemplateDeliverability(badSubject, badBody);

    expect(badScore.score).toBeLessThan(60);
    expect(badScore.isLaunchReady).toBe(false);
    expect(badScore.diagnostics.some((d) => d.title.includes("Missing Unsubscribe"))).toBe(true);
    expect(badScore.diagnostics.some((d) => d.title.includes("Spam Trigger Keywords"))).toBe(true);

    // High quality compliant email scenario
    const goodSubject = "Modernizing software architecture for {{company_name | default: 'your team'}}";
    const goodBody = "<p>Hi {{first_name}},</p><p>We build enterprise cloud systems at HENU OS.</p><p><a href='{{unsubscribe_url}}'>Unsubscribe here</a></p>";
    const goodScore = analyzeTemplateDeliverability(goodSubject, goodBody, "Hi, text version.");

    expect(goodScore.score).toBeGreaterThanOrEqual(85);
    expect(goodScore.isLaunchReady).toBe(true);
  });

  it("Generates email-client-safe table HTML from visual blocks", () => {
    const blocks: EmailBlock[] = [
      { id: "1", type: "heading", content: { text: "Welcome to HENU OS", level: "h1" } },
      { id: "2", type: "paragraph", content: { text: "We engineer high-performance systems." } },
      { id: "3", type: "button", content: { buttonText: "Learn More", buttonUrl: "https://henuos.com" } },
      { id: "4", type: "unsubscribe", content: { text: "Opt-out <a href='{{unsubscribe_url}}'>here</a>." } },
    ];

    const html = generateHtmlFromBlocks(blocks);
    expect(html).toContain("<table");
    expect(html).toContain("Welcome to HENU OS");
    expect(html).toContain("Learn More");
    expect(html).toContain("https://henuos.com");
    expect(html).toContain("Opt-out");
  });
});
