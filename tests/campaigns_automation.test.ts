import { describe, it, expect } from "vitest";
import { CampaignEngine, SequenceStep, SendingScheduleConfig, LeadSequenceProgress } from "../src/lib/campaigns/campaign-engine";
import { AutomationEngine, WorkflowNode } from "../src/lib/automations/automation-engine";
import { InboxManager } from "../src/lib/inbox/inbox-manager";

describe("Prompt 6: Campaigns + Automation + Follow-Up + Inbox", () => {
  // -------------------------------------------------------------
  // 1. Audience Calculation & Real-Time Screening
  // -------------------------------------------------------------
  describe("Audience Screening & Validation", () => {
    it("should accurately partition 438 leads into 12 suppressed, 4 invalid, and 422 ready", () => {
      const contacts: Array<{ id: string; email: string; isSuppressed?: boolean }> = [];
      const suppressionSet = new Set<string>();

      // 422 Ready
      for (let i = 1; i <= 422; i++) {
        contacts.push({ id: `c-${i}`, email: `valid.lead.${i}@company.com` });
      }

      // 12 Suppressed
      for (let i = 1; i <= 12; i++) {
        const suppEmail = `suppressed.lead.${i}@blocked.org`;
        contacts.push({ id: `supp-${i}`, email: suppEmail, isSuppressed: true });
        suppressionSet.add(suppEmail);
      }

      // 4 Invalid format
      contacts.push({ id: "inv-1", email: "missing-at-domain.com" });
      contacts.push({ id: "inv-2", email: "user@domain-without-extension" });
      contacts.push({ id: "inv-3", email: "plainaddress" });
      contacts.push({ id: "inv-4", email: "" });

      expect(contacts.length).toBe(438);

      const result = CampaignEngine.calculateAudienceScreening(contacts, suppressionSet);

      expect(result.totalRecipients).toBe(438);
      expect(result.suppressedCount).toBe(12);
      expect(result.invalidCount).toBe(4);
      expect(result.readyCount).toBe(422);
    });
  });

  // -------------------------------------------------------------
  // 2. Follow-Up Sequence & Stop Guardrails
  // -------------------------------------------------------------
  describe("Follow-Up Sequence & Stop Guardrails", () => {
    const steps: SequenceStep[] = [
      { id: "s-1", stepNumber: 1, stepType: "email", delayDays: 0, delayHours: 0, subject: "Initial Pitch", htmlContent: "<p>Pitch</p>" },
      { id: "s-2", stepNumber: 2, stepType: "email", delayDays: 3, delayHours: 0, subject: "Follow up 1", htmlContent: "<p>Follow</p>" },
      { id: "s-3", stepNumber: 3, stepType: "email", delayDays: 4, delayHours: 0, subject: "Final touch", htmlContent: "<p>Final</p>" },
    ];

    it("should proceed to step 1 for fresh active contact", () => {
      const progress: LeadSequenceProgress = {
        contactId: "cnt-1",
        campaignId: "cmp-1",
        currentStepIndex: 0,
        totalSteps: 3,
        status: "active",
        hasReplied: false,
        isUnsubscribed: false,
        isBounced: false,
        isSuppressed: false,
      };

      const evalRes = CampaignEngine.evaluateSequenceStep(progress, steps);
      expect(evalRes.action).toBe("send_next");
      expect(evalRes.stepToSend?.stepNumber).toBe(1);
    });

    it("should enforce Stop Rule 1: IF reply -> STOP", () => {
      const progress: LeadSequenceProgress = {
        contactId: "cnt-1",
        campaignId: "cmp-1",
        currentStepIndex: 1,
        totalSteps: 3,
        status: "active",
        hasReplied: true, // Lead replied
        isUnsubscribed: false,
        isBounced: false,
        isSuppressed: false,
      };

      const evalRes = CampaignEngine.evaluateSequenceStep(progress, steps);
      expect(evalRes.action).toBe("stop");
      expect(progress.status).toBe("stopped_reply");
      expect(evalRes.stopReason).toContain("replied");
    });

    it("should enforce Stop Rule 2: IF unsubscribe -> STOP", () => {
      const progress: LeadSequenceProgress = {
        contactId: "cnt-1",
        campaignId: "cmp-1",
        currentStepIndex: 1,
        totalSteps: 3,
        status: "active",
        hasReplied: false,
        isUnsubscribed: true, // Lead unsubscribed
        isBounced: false,
        isSuppressed: false,
      };

      const evalRes = CampaignEngine.evaluateSequenceStep(progress, steps);
      expect(evalRes.action).toBe("stop");
      expect(progress.status).toBe("stopped_unsubscribed");
    });

    it("should enforce Stop Rule 3: IF bounced -> STOP", () => {
      const progress: LeadSequenceProgress = {
        contactId: "cnt-1",
        campaignId: "cmp-1",
        currentStepIndex: 1,
        totalSteps: 3,
        status: "active",
        hasReplied: false,
        isUnsubscribed: false,
        isBounced: true, // Mailbox bounced
        isSuppressed: false,
      };

      const evalRes = CampaignEngine.evaluateSequenceStep(progress, steps);
      expect(evalRes.action).toBe("stop");
      expect(progress.status).toBe("stopped_bounced");
    });

    it("should enforce Stop Rule 4: IF manually suppressed -> STOP", () => {
      const progress: LeadSequenceProgress = {
        contactId: "cnt-1",
        campaignId: "cmp-1",
        currentStepIndex: 1,
        totalSteps: 3,
        status: "active",
        hasReplied: false,
        isUnsubscribed: false,
        isBounced: false,
        isSuppressed: true, // Manually blocked
      };

      const evalRes = CampaignEngine.evaluateSequenceStep(progress, steps);
      expect(evalRes.action).toBe("stop");
      expect(progress.status).toBe("stopped_suppressed");
    });
  });

  // -------------------------------------------------------------
  // 3. Timezone & Sending Window Evaluator
  // -------------------------------------------------------------
  describe("Timezone & Sending Window Evaluation", () => {
    const config: SendingScheduleConfig = {
      timezone: "America/New_York",
      sendImmediately: true,
      allowedDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      allowedHours: { start: 9, end: 17 }, // 9 AM to 5 PM
    };

    it("should allow sending during business hours Mon-Fri", () => {
      // 2:00 PM EST on a Wednesday (2026-10-07 18:00 UTC)
      const validDate = new Date("2026-10-07T18:00:00Z");
      const check = CampaignEngine.isWithinSendingWindow(config, validDate);
      expect(check.allowed).toBe(true);
    });

    it("should block sending during weekend outside configured window", () => {
      // Sunday (2026-10-04 18:00 UTC)
      const sundayDate = new Date("2026-10-04T18:00:00Z");
      const check = CampaignEngine.isWithinSendingWindow(config, sundayDate);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("not in allowed sending days");
    });

    it("should block sending during late night hours outside 09:00 - 17:00", () => {
      // 11:00 PM EST (2026-10-08 03:00 UTC)
      const nightDate = new Date("2026-10-08T03:00:00Z");
      const check = CampaignEngine.isWithinSendingWindow(config, nightDate);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("outside configured sending window");
    });
  });

  // -------------------------------------------------------------
  // 4. Visual Workflow Automation Engine
  // -------------------------------------------------------------
  describe("Automation Workflow Execution", () => {
    const workflow = {
      id: "wf-test-01",
      name: "Positive Reply Fast Follow",
      nodes: [
        {
          id: "n-1",
          type: "trigger" as const,
          title: "Reply Received",
          description: "Trigger on reply",
          config: { triggerType: "reply_received" },
          nextSuccessNodeId: "n-2",
        },
        {
          id: "n-2",
          type: "condition" as const,
          title: "Sentiment Check",
          description: "Check if sentiment is positive",
          config: { conditionType: "reply_sentiment", sentiment: "positive" },
          nextSuccessNodeId: "n-3",
          nextFailureNodeId: "n-4",
        },
        {
          id: "n-3",
          type: "action" as const,
          title: "Add Hot Lead Tag",
          description: "Tag lead as hot",
          config: { actionType: "add_tag", tag: "Hot Lead" },
        },
        {
          id: "n-4",
          type: "action" as const,
          title: "Assign Review",
          description: "Assign to support desk",
          config: { actionType: "assign_owner", owner: "Support Desk" },
        },
      ],
    };

    it("should take positive branch and apply tag on positive reply", () => {
      const context = {
        contact: { id: "cnt-1", email: "vikram@techcorp.in", tags: ["Outreach"] },
        event: {
          type: "reply_received" as const,
          payload: { sentiment: "positive" },
        },
      };

      const result = AutomationEngine.executeWorkflow(workflow, context);

      expect(result.status).toBe("completed");
      expect(result.executionPath).toEqual(["n-1", "n-2", "n-3"]);
      expect(context.contact.tags).toContain("Hot Lead");
    });

    it("should take negative/neutral branch when sentiment does not match", () => {
      const context = {
        contact: { id: "cnt-2", email: "uninterested@startup.com", tags: ["Outreach"] },
        event: {
          type: "reply_received" as const,
          payload: { sentiment: "negative" },
        },
      };

      const result = AutomationEngine.executeWorkflow(workflow, context);

      expect(result.status).toBe("completed");
      expect(result.executionPath).toEqual(["n-1", "n-2", "n-4"]);
      expect(context.contact.tags).not.toContain("Hot Lead");
    });
  });

  // -------------------------------------------------------------
  // 5. Inbox & Lead Triage Management
  // -------------------------------------------------------------
  describe("Inbox & Lead Triage Operations", () => {
    it("should list active threads and allow adding replies and notes", () => {
      const threads = InboxManager.getThreads();
      expect(threads.length).toBeGreaterThanOrEqual(2);

      const targetThreadId = threads[0].id;

      // Add reply
      const replyRes = InboxManager.addReply(targetThreadId, "Let's meet tomorrow at 4 PM.", "Admin", "admin@henuos.com");
      expect(replyRes.success).toBe(true);
      expect(replyRes.message?.body).toContain("meet tomorrow");

      // Add note
      const noteRes = InboxManager.addNote(targetThreadId, "Admin", "Follow-up confirmed with founder");
      expect(noteRes).toBe(true);

      // Verify thread state
      const updated = InboxManager.getThreadById(targetThreadId);
      expect(updated?.messages.some((m) => m.body.includes("meet tomorrow"))).toBe(true);
      expect(updated?.notes.some((n) => n.text.includes("Follow-up confirmed"))).toBe(true);
    });

    it("should suppress contact directly from inbox and update thread status", () => {
      const threads = InboxManager.getThreads();
      const targetThreadId = threads[1].id;

      const suppressRes = InboxManager.suppressContact(targetThreadId);
      expect(suppressRes.success).toBe(true);

      const updated = InboxManager.getThreadById(targetThreadId);
      expect(updated?.status).toBe("suppressed");
    });
  });
});
