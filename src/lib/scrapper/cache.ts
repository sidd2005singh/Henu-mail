// HENU MAIL / HENU SCRAPPER - Research Caching & Freshness Engine
// Organization: HENU OS Private Limited

import { ResearchPipelineResult } from "./types";
import { normalizeCompanyName } from "./importer";

export interface CachedResearchEntry {
  key: string;
  cin?: string;
  companyName: string;
  cachedAt: number; // Unix epoch ms
  expiresAt: number;
  result: ResearchPipelineResult;
}

export class ResearchCache {
  private static instance: ResearchCache;
  private cache: Map<string, CachedResearchEntry> = new Map();

  private constructor() {}

  public static getInstance(): ResearchCache {
    if (!ResearchCache.instance) {
      ResearchCache.instance = new ResearchCache();
    }
    return ResearchCache.instance;
  }

  private generateKey(cin?: string, companyName?: string): string {
    if (cin && cin.trim().length > 0) {
      return `cin:${cin.trim().toUpperCase()}`;
    }
    return `name:${normalizeCompanyName(companyName || "")}`;
  }

  public get(
    cin?: string,
    companyName?: string,
    forceFresh = false,
    maxFreshnessDays = 30
  ): ResearchPipelineResult | null {
    if (forceFresh) return null;

    const key = this.generateKey(cin, companyName);
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const ageInDays = (now - entry.cachedAt) / (1000 * 60 * 60 * 24);

    if (ageInDays > maxFreshnessDays || now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  public set(
    result: ResearchPipelineResult,
    cin?: string,
    companyName?: string,
    freshnessDays = 30
  ): void {
    const key = this.generateKey(cin || result.cin, companyName || result.verifiedCompanyName);
    const now = Date.now();
    const expiresAt = now + freshnessDays * 24 * 60 * 60 * 1000;

    this.cache.set(key, {
      key,
      cin: cin || result.cin,
      companyName: companyName || result.verifiedCompanyName,
      cachedAt: now,
      expiresAt,
      result,
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
