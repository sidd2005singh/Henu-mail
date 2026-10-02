// HENU MAIL / HENU SCRAPPER - Source Adapter Base Class & Interface
// Organization: HENU OS Private Limited

import { RawObservedEvidence } from "../types";
import { RawDirectorObservation } from "../director-matcher";
import { ObservedEntityObservation } from "../identity-matcher";

export interface AdapterQueryResult {
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  observedAt: string;
  entityObservation?: ObservedEntityObservation;
  directorObservations: RawDirectorObservation[];
  contactObservations: Array<{
    value: string;
    type: "email" | "direct_phone" | "mobile" | "website" | "linkedin" | "twitter";
    label?: string;
    personName?: string;
    evidenceText: string;
    sourceUrl: string;
  }>;
  rawEvidence: RawObservedEvidence[];
  success: boolean;
  errorMessage?: string;
}

export abstract class ResearchSourceAdapter {
  abstract readonly sourceId: string;
  abstract readonly sourceName: string;
  abstract readonly sourceType: string;
  abstract readonly rateLimitPerMinute: number;

  abstract search(query: string, options?: Record<string, unknown>): Promise<AdapterQueryResult>;
  abstract verifyIdentity(cin: string, companyName: string): Promise<AdapterQueryResult>;
  abstract extractDirectors(cin: string, companyName: string): Promise<AdapterQueryResult>;
}
