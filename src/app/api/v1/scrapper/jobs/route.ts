/**
 * HENU SCRAPPER - Research Jobs Orchestration API Route
 * GET /api/v1/scrapper/jobs - List research jobs
 * POST /api/v1/scrapper/jobs - Create or control research jobs
 */

import { NextRequest, NextResponse } from "next/server";
import { globalScrapperJobs } from "@/lib/scrapper/store";

export async function GET() {
  try {
    const jobs = Array.from(globalScrapperJobs.values()).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      total: jobs.length,
      jobs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch research jobs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, jobId, title, totalCompanies = 0 } = body;

    if (action === "pause" && jobId) {
      const job = globalScrapperJobs.get(jobId);
      if (job) {
        job.status = "PAUSED";
        job.pausedAt = new Date().toISOString();
        globalScrapperJobs.set(jobId, job);
      }
      return NextResponse.json({ success: true, job });
    }

    if (action === "resume" && jobId) {
      const job = globalScrapperJobs.get(jobId);
      if (job) {
        job.status = "RUNNING";
        globalScrapperJobs.set(jobId, job);
      }
      return NextResponse.json({ success: true, job });
    }

    if (action === "cancel" && jobId) {
      const job = globalScrapperJobs.get(jobId);
      if (job) {
        job.status = "CANCELLED";
        job.cancelledAt = new Date().toISOString();
        globalScrapperJobs.set(jobId, job);
      }
      return NextResponse.json({ success: true, job });
    }

    // Create new job
    const newJobId = `job-${Date.now()}`;
    const newJob = {
      id: newJobId,
      title: title || `Company Research Pipeline #${globalScrapperJobs.size + 1}`,
      status: "RUNNING",
      totalCompanies: Number(totalCompanies) || 1,
      processedCompanies: 0,
      successfulCompanies: 0,
      failedCompanies: 0,
      needsReviewCompanies: 0,
      totalDirectorsFound: 0,
      totalEmailsFound: 0,
      totalPhonesFound: 0,
      totalWebsitesFound: 0,
      progressPercentage: 10,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalScrapperJobs.set(newJobId, newJob);

    return NextResponse.json({
      success: true,
      job: newJob,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to execute job action";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
