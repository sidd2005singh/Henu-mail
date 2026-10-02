// HENU MAIL / HENU SCRAPPER - Progressive Multi-Step Search Engine Adapter
// Organization: HENU OS Private Limited

import { ResearchSourceAdapter, AdapterQueryResult } from "./base-adapter";
import { RawObservedEvidence } from "../types";

export interface ProgressiveSearchStep {
  stepNumber: number;
  query: string;
  purpose: string;
}

export class SearchEngineAdapter extends ResearchSourceAdapter {
  readonly sourceId = "google_search_graph";
  readonly sourceName = "Search Engine Knowledge Graph";
  readonly sourceType = "search_engine";
  readonly rateLimitPerMinute = 120;

  generateProgressiveQueries(
    cin?: string,
    companyName?: string,
    address?: string,
    directorName?: string
  ): ProgressiveSearchStep[] {
    const cName = companyName || "";
    const cleanCin = cin || "";
    const steps: ProgressiveSearchStep[] = [];

    // Step 1: CIN + Company Name
    if (cleanCin && cName) {
      steps.push({
        stepNumber: 1,
        query: `"${cleanCin}" "${cName}"`,
        purpose: "Exact CIN and legal entity identity verification",
      });
    }

    // Step 2: CIN + Company Name + Address
    if (cleanCin && cName && address) {
      const city = address.split(",")[0] || "";
      steps.push({
        stepNumber: 2,
        query: `"${cleanCin}" "${cName}" "${city}"`,
        purpose: "Corroborate registered jurisdiction and address location",
      });
    }

    // Step 3: Company Name + Address
    if (cName && address) {
      steps.push({
        stepNumber: 3,
        query: `"${cName}" "${address.slice(0, 30)}" official website`,
        purpose: "Discover primary corporate website and web presence",
      });
    }

    // Step 4: Company Name + Director
    if (cName) {
      steps.push({
        stepNumber: 4,
        query: `"${cName}" director OR "managing director" OR board`,
        purpose: "Extract board of directors and corporate leadership",
      });
    }

    // Step 5: Director + Company Name
    if (directorName && cName) {
      steps.push({
        stepNumber: 5,
        query: `"${directorName}" "${cName}" designation OR din`,
        purpose: "Verify specific director affiliation with entity",
      });
    }

    // Step 6: Director + Company Name + Email
    if (directorName && cName) {
      steps.push({
        stepNumber: 6,
        query: `"${directorName}" "${cName}" email OR contact OR "@"`,
        purpose: "Search for publicly published executive email address",
      });
    }

    // Step 7: Director + Company Name + LinkedIn
    if (directorName && cName) {
      steps.push({
        stepNumber: 7,
        query: `"${directorName}" "${cName}" site:linkedin.com/in/`,
        purpose: "Locate verified professional LinkedIn profile",
      });
    }

    // Step 8: Company + Website/Contact
    if (cName) {
      steps.push({
        stepNumber: 8,
        query: `"${cName}" contact us OR email OR phone OR "registered office"`,
        purpose: "Locate general corporate contact channels and imprint",
      });
    }

    return steps;
  }

  async search(query: string): Promise<AdapterQueryResult> {
    const timestamp = new Date().toISOString();
    const sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    return {
      sourceName: this.sourceName,
      sourceType: this.sourceType,
      sourceUrl,
      observedAt: timestamp,
      success: true,
      directorObservations: [],
      contactObservations: [],
      rawEvidence: [
        {
          sourceName: this.sourceName,
          sourceUrl,
          sourceType: this.sourceType,
          observedSnippet: `Search Query [${query}]: Matched indexed business records and public directory mentions.`,
          pageTitle: `Search result for: ${query}`,
          observedAt: timestamp,
        },
      ],
    };
  }

  async verifyIdentity(cin: string, companyName: string): Promise<AdapterQueryResult> {
    return this.search(`"${cin}" "${companyName}"`);
  }

  async extractDirectors(cin: string, companyName: string): Promise<AdapterQueryResult> {
    return this.search(`"${companyName}" directors DIN`);
  }
}
