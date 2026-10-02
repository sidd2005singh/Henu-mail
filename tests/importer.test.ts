import { describe, it, expect } from "vitest";
import { parseCsvText } from "@/lib/importer/spreadsheet-parser";
import { detectColumnMapping, autoDetectAllHeaders } from "@/lib/importer/column-detector";
import { cleanAndValidateImportBatch } from "@/lib/importer/cleaner-validator";
import { evaluateSegment, SegmentFilterCriteria } from "@/lib/importer/segment-compiler";

describe("HENU MAIL Contact Ingestion & Data Cleaning Suite", () => {
  it("Parses raw CSV text into headers and structured row records", () => {
    const csvContent = `First Name,Last Name,Email,Company,City\nVikram,Sharma,vikram@henuos.com,HENU OS,Bangalore\nAnanya,Patel,ananya@henuos.com,Innovate Health,Delhi`;
    const parsed = parseCsvText(csvContent, "test.csv");

    expect(parsed.headers).toEqual(["First Name", "Last Name", "Email", "Company", "City"]);
    expect(parsed.totalRows).toBe(2);
    expect(parsed.rows[0]["Email"]).toBe("vikram@henuos.com");
  });

  it("Auto-detects synonyms and maps columns with high confidence", () => {
    const headers = ["Business Owner", "Corporate Email", "Organization Name", "Mobile Number", "Metro Location"];
    const detected = autoDetectAllHeaders(headers);

    const emailMapping = detected.find((d) => d.csvHeader === "Corporate Email");
    expect(emailMapping?.targetField).toBe("email");
    expect(emailMapping?.confidence).toBeGreaterThanOrEqual(0.85);

    const ownerMapping = detected.find((d) => d.csvHeader === "Business Owner");
    expect(ownerMapping?.targetField).toBe("owner_name");

    const compMapping = detected.find((d) => d.csvHeader === "Organization Name");
    expect(compMapping?.targetField).toBe("company_name");
  });

  it("Validates, sanitizes, deduplicates, and scrubs against suppression list", () => {
    const rawRows = [
      { "Full Name": "Vikram Sharma", "Work Email": "vikram@henuos.com", Company: "HENU OS" },
      { "Full Name": "Bad Email User", "Work Email": "invalid-email-syntax", Company: "Fake Co" },
      { "Full Name": "Suppressed Client", "Work Email": "bad-mailbox@spam-trap-domain.net", Company: "Blacklist Inc" },
      { "Full Name": "Duplicate User", "Work Email": "vikram@henuos.com", Company: "HENU OS Copy" },
      { "Full Name": "Existing DB Contact", "Work Email": "existing@db.com", Company: "DB Co" },
    ];

    const fieldMapping = {
      "Full Name": "owner_name",
      "Work Email": "email",
      Company: "company_name",
    };

    const existingEmails = new Set(["existing@db.com"]);
    const suppressionList = new Set(["@spam-trap-domain.net"]);

    const result = cleanAndValidateImportBatch(rawRows, {
      fieldMapping,
      existingEmails,
      suppressionList,
    });

    expect(result.totalRows).toBe(5);
    expect(result.validCount).toBe(1); // Only row 1 is valid
    expect(result.invalidCount).toBe(1); // Row 2 has invalid syntax
    expect(result.suppressedCount).toBe(1); // Row 3 is in suppression list
    expect(result.duplicateCount).toBe(2); // Row 4 is duplicate in file, Row 5 is existing in DB
  });

  it("Evaluates dynamic segment rules with AND, OR, NOT Boolean logic", () => {
    const contact1 = {
      industry: "AI Automation",
      city: "Ahmedabad",
      status: "active",
      engagement_score: 85,
      tags: ["AI", "Founder"],
    };

    const contact2 = {
      industry: "Real Estate",
      city: "Mumbai",
      status: "active",
      engagement_score: 50,
      tags: ["Broker"],
    };

    const criteria: SegmentFilterCriteria = {
      logic: "AND",
      groups: [
        {
          id: "g1",
          logic: "AND",
          rules: [
            { id: "r1", field: "industry", operator: "equals", value: "AI Automation" },
            { id: "r2", field: "engagement_score", operator: "greater_than", value: 80 },
          ],
        },
      ],
    };

    expect(evaluateSegment(contact1, criteria)).toBe(true);
    expect(evaluateSegment(contact2, criteria)).toBe(false);
  });
});
