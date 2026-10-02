/**
 * HENU MAIL - Automations API Route
 * GET /api/v1/automations - List workflow automations
 * POST /api/v1/automations - Create or trigger automation execution
 */

import { NextRequest, NextResponse } from "next/server";
import { AutomationEngine, WorkflowNode } from "@/lib/automations/automation-engine";

export async function GET() {
  return NextResponse.json({
    success: true,
    automations: [
      {
        id: "wf-101",
        name: "Auto-Tag Interested Replies & CRM Sync",
        status: "active",
        trigger: "reply_received",
        nodesCount: 5,
        executionCount: 42,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "wf-102",
        name: "Global Bounce & Reputation Suppression Guard",
        status: "active",
        trigger: "campaign_completed",
        nodesCount: 4,
        executionCount: 18,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "wf-103",
        name: "New Founder Ingestion - Fast Follow Sequence",
        status: "active",
        trigger: "contact_added",
        nodesCount: 6,
        executionCount: 89,
        updatedAt: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "create", workflow, context } = body;

    if (action === "test_execution" && workflow && context) {
      const result = AutomationEngine.executeWorkflow(workflow, context);
      return NextResponse.json({ success: true, executionResult: result });
    }

    const workflowId = `wf-${Date.now()}`;
    return NextResponse.json({
      success: true,
      workflow: {
        id: workflowId,
        ...workflow,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute automation route",
      },
      { status: 500 }
    );
  }
}
