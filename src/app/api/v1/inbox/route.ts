/**
 * HENU MAIL - Inbox API Route
 * GET /api/v1/inbox - List conversation threads
 * POST /api/v1/inbox - Reply, update status, add note, suppress contact
 */

import { NextRequest, NextResponse } from "next/server";
import { InboxManager, ThreadStatus } from "@/lib/inbox/inbox-manager";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ThreadStatus | undefined;
    const campaignId = searchParams.get("campaignId") || undefined;

    const threads = InboxManager.getThreads({ status, campaignId });

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch inbox threads",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, threadId, replyText, senderName = "Vikram @ HENU OS", senderEmail = "vikram@henuos.com", status, noteText, author = "Admin" } = body;

    if (!threadId) {
      return NextResponse.json({ success: false, error: "Thread ID is required" }, { status: 400 });
    }

    switch (action) {
      case "reply": {
        if (!replyText) {
          return NextResponse.json({ success: false, error: "Reply text is required" }, { status: 400 });
        }
        const replyResult = InboxManager.addReply(threadId, replyText, senderName, senderEmail);
        return NextResponse.json(replyResult);
      }

      case "update_status": {
        if (!status) {
          return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
        }
        const updated = InboxManager.updateStatus(threadId, status);
        return NextResponse.json({ success: updated, status });
      }

      case "add_note": {
        if (!noteText) {
          return NextResponse.json({ success: false, error: "Note text is required" }, { status: 400 });
        }
        const noteAdded = InboxManager.addNote(threadId, author, noteText);
        return NextResponse.json({ success: noteAdded });
      }

      case "suppress": {
        const suppressResult = InboxManager.suppressContact(threadId);
        return NextResponse.json({
          success: suppressResult.success,
          message: `Contact ${suppressResult.contactEmail} has been added to global suppression list. All active campaigns for this contact halted.`,
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Invalid action '${action}'` }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute inbox action",
      },
      { status: 500 }
    );
  }
}
