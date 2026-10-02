// HENU MAIL / HENU SCRAPPER - Persistent Queue Manager & Execution Orchestrator
// Organization: HENU OS Private Limited

import { ResearchEngine, DEFAULT_STANDARD_PROFILE } from "./research-engine";
import { ResearchProfileConfig, ResearchPipelineResult } from "./types";
import { globalScrapperCompanies, globalScrapperJobs } from "./store";

export interface ScrapperQueueItem {
  itemId: string;
  companyId: string;
  companyName: string;
  cin?: string;
  address?: string;
  stateCode?: string;
  rocCode?: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "PARTIAL" | "NEEDS_REVIEW" | "FAILED" | "CANCELLED";
  attempts: number;
  result?: ResearchPipelineResult;
  errorMessage?: string;
}

export interface ScrapperJobExecution {
  jobId: string;
  title: string;
  profile: ResearchProfileConfig;
  status: "QUEUED" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED";
  items: ScrapperQueueItem[];
  totalCompanies: number;
  processedCompanies: number;
  successfulCompanies: number;
  failedCompanies: number;
  needsReviewCompanies: number;
  totalDirectorsFound: number;
  totalEmailsFound: number;
  totalWebsitesFound: number;
  progressPercentage: number;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  cancelledAt?: string;
}

export class ScrapperQueueManager {
  private static instance: ScrapperQueueManager;
  private jobs: Map<string, ScrapperJobExecution> = new Map();
  private isGlobalPaused = false;
  private engine = new ResearchEngine();

  private constructor() {}

  public static getInstance(): ScrapperQueueManager {
    if (!ScrapperQueueManager.instance) {
      ScrapperQueueManager.instance = new ScrapperQueueManager();
    }
    return ScrapperQueueManager.instance;
  }

  public createJob(
    title: string,
    companies: Array<{
      id: string;
      companyName: string;
      cin?: string;
      address?: string;
      stateCode?: string;
      rocCode?: string;
    }>,
    profile: ResearchProfileConfig = DEFAULT_STANDARD_PROFILE
  ): ScrapperJobExecution {
    const jobId = `job-${Date.now()}`;
    const items: ScrapperQueueItem[] = companies.map((c, idx) => ({
      itemId: `item-${jobId}-${idx}`,
      companyId: c.id,
      companyName: c.companyName,
      cin: c.cin,
      address: c.address,
      stateCode: c.stateCode,
      rocCode: c.rocCode,
      status: "QUEUED",
      attempts: 0,
    }));

    const job: ScrapperJobExecution = {
      jobId,
      title,
      profile,
      status: "QUEUED",
      items,
      totalCompanies: companies.length,
      processedCompanies: 0,
      successfulCompanies: 0,
      failedCompanies: 0,
      needsReviewCompanies: 0,
      totalDirectorsFound: 0,
      totalEmailsFound: 0,
      totalWebsitesFound: 0,
      progressPercentage: 0,
      startedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    // Sync with global API registry
    globalScrapperJobs.set(jobId, {
      id: jobId,
      title,
      status: "RUNNING",
      totalCompanies: companies.length,
      processedCompanies: 0,
      successfulCompanies: 0,
      failedCompanies: 0,
      needsReviewCompanies: 0,
      totalDirectorsFound: 0,
      totalEmailsFound: 0,
      totalPhonesFound: 0,
      totalWebsitesFound: 0,
      progressPercentage: 0,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Start asynchronous worker loop
    this.processJob(jobId);

    return job;
  }

  public async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status === "CANCELLED" || this.isGlobalPaused) return;

    job.status = "RUNNING";

    for (let i = 0; i < job.items.length; i++) {
      const item = job.items[i];
      const currentJobStatus = (this.jobs.get(jobId)?.status || job.status) as string;
      if (currentJobStatus === "PAUSED" || currentJobStatus === "CANCELLED" || this.isGlobalPaused) {
        break;
      }
      if (item.status === "COMPLETED") continue;

      item.status = "PROCESSING";
      item.attempts += 1;

      try {
        const result = await this.engine.executeResearchPipeline(
          {
            id: item.companyId,
            cin: item.cin,
            companyName: item.companyName,
            address: item.address,
            stateCode: item.stateCode,
            rocCode: item.rocCode,
          },
          job.profile
        );

        item.result = result;
        item.status = result.researchStatus === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "COMPLETED";

        // Update company in global repository
        const existingComp = globalScrapperCompanies.get(item.companyId);
        if (existingComp) {
          existingComp.verifiedCompanyName = result.verifiedCompanyName;
          existingComp.verifiedAddress = result.verifiedAddress;
          existingComp.website = result.website;
          existingComp.verificationStatus = result.confidence === "HIGH" ? "verified" : "partially_verified";
          existingComp.verificationConfidence = result.confidenceScore;
          existingComp.researchStatus = item.status;
          existingComp.directorCount = result.directors.length;
          existingComp.contactCount = result.contacts.length;
          existingComp.evidenceCount = result.evidenceList.length;
          existingComp.directors = result.directors.map((d, dIdx) => ({
            id: `rel-${item.companyId}-${dIdx}`,
            companyId: item.companyId,
            directorId: `dir-${item.companyId}-${dIdx}`,
            din: d.din,
            designation: d.designation,
            appointmentDate: d.appointmentDate,
            isActive: d.isActive,
            isSignatory: d.isSignatory,
            sourceName: d.source,
            confidence: d.confidenceScore,
            verificationStatus: d.status.toLowerCase(),
            director: {
              id: `dir-${item.companyId}-${dIdx}`,
              din: d.din,
              name: d.name,
              designation: d.designation,
              email: d.email,
              mobile: d.mobile,
              linkedinUrl: d.linkedinUrl,
              status: d.isActive ? "active" : "inactive",
              confidence: d.confidenceScore,
              verificationStatus: "verified",
            },
          }));
          existingComp.contacts = result.contacts.map((c, cIdx) => ({
            id: `cp-${item.companyId}-${cIdx}`,
            pointType: c.type,
            value: c.value,
            normalizedValue: c.value,
            label: c.type === "email" ? "Executive Email" : "Direct Contact",
            isPrimary: cIdx === 0,
            verificationStatus: c.verificationStatus === "VERIFIED" ? "verified" : "deliverable",
            confidence: c.confidenceScore,
          }));
          existingComp.evidence = result.evidenceList.map((e) => ({
            id: e.id,
            attributeDiscovered: e.extractedField,
            snippet: e.observedText,
            sourceName: e.source,
            sourceUrl: e.url,
            confidence: 0.90,
            verificationStatus: "accepted",
            discoveredAt: e.sourceTimestamp,
          }));
          globalScrapperCompanies.set(item.companyId, existingComp);
        }

        job.processedCompanies += 1;
        if (item.status === "COMPLETED") job.successfulCompanies += 1;
        if (item.status === "NEEDS_REVIEW") job.needsReviewCompanies += 1;

        job.totalDirectorsFound += result.directors.length;
        job.totalEmailsFound += result.contacts.filter((c) => c.type === "email").length;
        if (result.website) job.totalWebsitesFound += 1;
      } catch (err: unknown) {
        item.status = "FAILED";
        item.errorMessage = (err as Error).message;
        job.processedCompanies += 1;
        job.failedCompanies += 1;
      }

      job.progressPercentage = Math.round((job.processedCompanies / job.totalCompanies) * 100);

      // Sync state with globalScrapperJobs
      const registeredJob = globalScrapperJobs.get(jobId);
      if (registeredJob) {
        registeredJob.processedCompanies = job.processedCompanies;
        registeredJob.successfulCompanies = job.successfulCompanies;
        registeredJob.failedCompanies = job.failedCompanies;
        registeredJob.needsReviewCompanies = job.needsReviewCompanies;
        registeredJob.totalDirectorsFound = job.totalDirectorsFound;
        registeredJob.totalEmailsFound = job.totalEmailsFound;
        registeredJob.totalWebsitesFound = job.totalWebsitesFound;
        registeredJob.progressPercentage = job.progressPercentage;
        globalScrapperJobs.set(jobId, registeredJob);
      }
    }

    if (job.processedCompanies >= job.totalCompanies) {
      job.status = "COMPLETED";
      job.completedAt = new Date().toISOString();
      const reg = globalScrapperJobs.get(jobId);
      if (reg) {
        reg.status = "COMPLETED";
        reg.completedAt = job.completedAt;
        globalScrapperJobs.set(jobId, reg);
      }
    }
  }

  public pauseJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = "PAUSED";
    job.pausedAt = new Date().toISOString();
    return true;
  }

  public resumeJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = "RUNNING";
    this.processJob(jobId);
    return true;
  }

  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = "CANCELLED";
    job.cancelledAt = new Date().toISOString();
    return true;
  }

  public pauseAllJobs(): void {
    this.isGlobalPaused = true;
    for (const job of this.jobs.values()) {
      if (job.status === "RUNNING") {
        job.status = "PAUSED";
        job.pausedAt = new Date().toISOString();
      }
    }
  }

  public stopAllJobs(): void {
    this.isGlobalPaused = true;
    for (const job of this.jobs.values()) {
      if (job.status === "RUNNING" || job.status === "PAUSED") {
        job.status = "CANCELLED";
        job.cancelledAt = new Date().toISOString();
      }
    }
  }

  public retryJob(
    jobId: string,
    mode: "all" | "failed" | "needs_review" | "selected",
    selectedIds?: string[]
  ): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    for (const item of job.items) {
      if (mode === "failed" && item.status === "FAILED") {
        item.status = "QUEUED";
      } else if (mode === "needs_review" && item.status === "NEEDS_REVIEW") {
        item.status = "QUEUED";
      } else if (mode === "selected" && selectedIds?.includes(item.companyId)) {
        item.status = "QUEUED";
      } else if (mode === "all") {
        item.status = "QUEUED";
      }
    }

    job.status = "RUNNING";
    this.processJob(jobId);
    return true;
  }

  public getJob(jobId: string): ScrapperJobExecution | undefined {
    return this.jobs.get(jobId);
  }

  public getAllJobs(): ScrapperJobExecution[] {
    return Array.from(this.jobs.values());
  }
}
