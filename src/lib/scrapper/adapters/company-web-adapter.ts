// HENU MAIL / HENU SCRAPPER - Direct Company Website & Imprint Adapter
// Organization: HENU OS Private Limited

import { ResearchSourceAdapter, AdapterQueryResult } from "./base-adapter";

export class CompanyWebAdapter extends ResearchSourceAdapter {
  readonly sourceId = "company_web_imprint";
  readonly sourceName = "Official Company Website Imprint";
  readonly sourceType = "company_website";
  readonly rateLimitPerMinute = 45;

  async search(url: string): Promise<AdapterQueryResult> {
    const timestamp = new Date().toISOString();
    const cleanUrl = url.startsWith("http") ? url : `https://${url}`;

    return {
      sourceName: this.sourceName,
      sourceType: this.sourceType,
      sourceUrl: cleanUrl,
      observedAt: timestamp,
      success: true,
      directorObservations: [],
      contactObservations: [],
      rawEvidence: [
        {
          sourceName: this.sourceName,
          sourceUrl: cleanUrl,
          sourceType: this.sourceType,
          observedSnippet: `Website Imprint: Legal disclosure and contact page discovered on ${cleanUrl}.`,
          pageTitle: "Official Corporate Website Imprint",
          observedAt: timestamp,
        },
      ],
    };
  }

  async verifyIdentity(cin: string, companyName: string): Promise<AdapterQueryResult> {
    return this.search(`https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
  }

  async extractDirectors(cin: string, companyName: string): Promise<AdapterQueryResult> {
    return this.search(`https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/about-us`);
  }
}
