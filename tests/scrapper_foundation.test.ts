// HENU MAIL / HENU SCRAPPER - Foundation & Architecture Unit Tests
// Organization: HENU OS Private Limited

import { describe, it, expect } from "vitest";
import {
  detectMcaColumns,
  normalizeCompanyName,
  normalizeAddress,
  validateCompanyRow,
  analyzeSpreadsheetForScrapper,
} from "@/lib/scrapper/importer";
import { hasPermission } from "@/lib/rbac/permissions";
import { ParsedSpreadsheet } from "@/lib/importer/spreadsheet-parser";

describe("HENU SCRAPPER - Column Detection & Heuristics", () => {
  it("should accurately detect all 11 standard MCA/ROC column headers", () => {
    const rawHeaders = [
      "CIN",
      "CompanyName",
      "CompanyCategory",
      "CompanyROCcode",
      "CompanySubCategory",
      "CompanyClass",
      "AuthorizedCapital",
      "CompanyRegistrationdate_date",
      "Registered_Office_Address",
      "CompanyStateCode",
      "CompanyIndustrialClassification",
    ];

    const { mapping, confidenceScore } = detectMcaColumns(rawHeaders);

    expect(mapping.cin).toBe("CIN");
    expect(mapping.companyName).toBe("CompanyName");
    expect(mapping.companyCategory).toBe("CompanyCategory");
    expect(mapping.companyRocCode).toBe("CompanyROCcode");
    expect(mapping.companySubCategory).toBe("CompanySubCategory");
    expect(mapping.companyClass).toBe("CompanyClass");
    expect(mapping.authorizedCapital).toBe("AuthorizedCapital");
    expect(mapping.registrationDate).toBe("CompanyRegistrationdate_date");
    expect(mapping.registeredOfficeAddress).toBe("Registered_Office_Address");
    expect(mapping.stateCode).toBe("CompanyStateCode");
    expect(mapping.industrialClassification).toBe("CompanyIndustrialClassification");
    expect(confidenceScore).toBeGreaterThanOrEqual(0.9);
  });

  it("should detect real-world header synonyms and spaced variants", () => {
    const rawHeaders = [
      "Corporate Identity Number",
      "Legal Entity Name",
      "Category",
      "ROC",
      "Sub Category",
      "Class",
      "Auth Capital",
      "Date of Incorporation",
      "Full Address",
      "State",
      "NIC Code",
    ];

    const { mapping } = detectMcaColumns(rawHeaders);

    expect(mapping.cin).toBe("Corporate Identity Number");
    expect(mapping.companyName).toBe("Legal Entity Name");
    expect(mapping.companyCategory).toBe("Category");
    expect(mapping.companyRocCode).toBe("ROC");
    expect(mapping.authorizedCapital).toBe("Auth Capital");
    expect(mapping.registrationDate).toBe("Date of Incorporation");
    expect(mapping.registeredOfficeAddress).toBe("Full Address");
    expect(mapping.stateCode).toBe("State");
    expect(mapping.industrialClassification).toBe("NIC Code");
  });
});

describe("HENU SCRAPPER - Normalization & Row Validation", () => {
  it("should normalize company name and strip special characters", () => {
    const raw = "  henu tech ventures pvt. ltd. (india)  ";
    const normalized = normalizeCompanyName(raw);
    expect(normalized).toBe("HENU TECH VENTURES PVT LTD INDIA");
  });

  it("should normalize multi-line addresses with extra commas and whitespace", () => {
    const raw = "Plot 42,   Okhla Phase 3,, New Delhi ,  110020 ";
    const normalized = normalizeAddress(raw);
    expect(normalized).toBe("Plot 42, Okhla Phase 3, New Delhi , 110020");
  });

  it("should detect duplicate CIN records in batch import", () => {
    const mapping = {
      cin: "CIN",
      companyName: "CompanyName",
    };

    const seenCins = new Set<string>();
    const seenNames = new Set<string>();

    const row1 = { CIN: "U72200DL2021PTC384912", CompanyName: "Alpha Corp" };
    const row2 = { CIN: "U72200DL2021PTC384912", CompanyName: "Alpha Corp Duplicate" };

    const v1 = validateCompanyRow(row1, 1, mapping, seenCins, seenNames);
    const v2 = validateCompanyRow(row2, 2, mapping, seenCins, seenNames);

    expect(v1.isValid).toBe(true);
    expect(v1.isDuplicate).toBe(false);
    expect(v2.isDuplicate).toBe(true);
    expect(v2.isValid).toBe(false);
    expect(v2.validationErrors).toContain("Duplicate CIN detected in file (U72200DL2021PTC384912)");
  });

  it("should handle missing CIN rows without breaking execution", () => {
    const mapping = {
      cin: "CIN",
      companyName: "CompanyName",
    };

    const seenCins = new Set<string>();
    const seenNames = new Set<string>();

    const row = { CIN: "", CompanyName: "Entity Without CIN" };
    const v = validateCompanyRow(row, 1, mapping, seenCins, seenNames);

    expect(v.isMissingCin).toBe(true);
    expect(v.mapped.companyName).toBe("Entity Without CIN");
  });
});

describe("HENU SCRAPPER - Spreadsheet Ingestion Pipeline", () => {
  it("should process a parsed spreadsheet and return full metrics", async () => {
    const parsed: ParsedSpreadsheet = {
      filename: "mca_delhi_export.xlsx",
      fileType: "xlsx",
      fileSize: 1024,
      sheetNames: ["Companies"],
      activeSheet: "Companies",
      headers: ["CIN", "CompanyName", "CompanyROCcode", "Registered_Office_Address"],
      rows: [
        {
          CIN: "U72200DL2021PTC384912",
          CompanyName: "Henu Tech Ventures",
          CompanyROCcode: "RoC-Delhi",
          Registered_Office_Address: "Okhla New Delhi",
        },
        {
          CIN: "U24230MH2019PTC328400",
          CompanyName: "Aura Pharma Solutions",
          CompanyROCcode: "RoC-Mumbai",
          Registered_Office_Address: "Andheri East Mumbai",
        },
      ],
      totalRows: 2,
    };

    const analysis = await analyzeSpreadsheetForScrapper(parsed);

    expect(analysis.totalRows).toBe(2);
    expect(analysis.validRows).toBe(2);
    expect(analysis.duplicateRows).toBe(0);
    expect(analysis.missingCinRows).toBe(0);
    expect(analysis.allRows.length).toBe(2);
    expect(analysis.allRows[0].mapped.companyName).toBe("Henu Tech Ventures");
  });
});

describe("HENU SCRAPPER - RBAC Access Control", () => {
  it("should grant scrapper permissions to owner and admin roles", () => {
    expect(hasPermission("owner", "scrapper:view")).toBe(true);
    expect(hasPermission("owner", "scrapper:import")).toBe(true);
    expect(hasPermission("owner", "scrapper:research")).toBe(true);
    expect(hasPermission("owner", "scrapper:export")).toBe(true);
    expect(hasPermission("owner", "scrapper:admin")).toBe(true);

    expect(hasPermission("admin", "scrapper:view")).toBe(true);
    expect(hasPermission("admin", "scrapper:admin")).toBe(true);
  });

  it("should enforce scoped role restrictions for campaign managers and viewers", () => {
    expect(hasPermission("campaign_manager", "scrapper:view")).toBe(true);
    expect(hasPermission("campaign_manager", "scrapper:import")).toBe(true);
    expect(hasPermission("campaign_manager", "scrapper:admin")).toBe(false);

    expect(hasPermission("viewer", "scrapper:view")).toBe(true);
    expect(hasPermission("viewer", "scrapper:import")).toBe(false);
    expect(hasPermission("viewer", "scrapper:research")).toBe(false);
  });
});
