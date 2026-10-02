/**
 * HENU MAIL - Inbox & Reply Management Engine
 * HENU OS PRIVATE LIMITED
 *
 * Provides complete inbox operations:
 * - Reply triage & sentiment tracking
 * - 1-Click reply dispatch
 * - Note taking
 * - Follow-up scheduling
 * - One-click contact suppression (halts all running campaign follow-ups)
 */

export type ReplySentiment = "positive" | "negative" | "neutral" | "question" | "out_of_office";

export type ThreadStatus =
  | "unhandled"
  | "interested"
  | "not_interested"
  | "meeting_booked"
  | "follow_up_scheduled"
  | "suppressed"
  | "archived";

export interface ThreadMessage {
  id: string;
  sender: string;
  senderEmail: string;
  recipientEmail: string;
  body: string;
  timestamp: string;
  isInbound: boolean;
}

export interface ThreadRecord {
  id: string;
  contactId: string;
  senderName: string;
  senderEmail: string;
  senderCompany: string;
  campaignId: string;
  campaignName: string;
  subject: string;
  snippet: string;
  sentiment: ReplySentiment;
  status: ThreadStatus;
  messages: ThreadMessage[];
  notes: Array<{ id: string; author: string; text: string; createdAt: string }>;
  followUpDueAt?: string;
  createdAt: string;
  lastActivityAt: string;
}

export class InboxManager {
  private static threads = new Map<string, ThreadRecord>();

  /**
   * Initializes or fetches thread collection.
   */
  public static getThreads(filter?: { status?: ThreadStatus; campaignId?: string }): ThreadRecord[] {
    if (this.threads.size === 0) {
      this.seedSampleThreads();
    }

    let list = Array.from(this.threads.values());
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    if (filter?.campaignId) {
      list = list.filter((t) => t.campaignId === filter.campaignId);
    }
    return list.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
  }

  public static getThreadById(id: string): ThreadRecord | undefined {
    if (this.threads.size === 0) this.seedSampleThreads();
    return this.threads.get(id);
  }

  /**
   * Dispatches a direct reply in the thread.
   */
  public static addReply(
    threadId: string,
    replyText: string,
    senderName: string,
    senderEmail: string
  ): { success: boolean; message?: ThreadMessage; error?: string } {
    const thread = this.getThreadById(threadId);
    if (!thread) return { success: false, error: "Thread not found" };

    const newMsg: ThreadMessage = {
      id: `msg-${Date.now()}`,
      sender: senderName,
      senderEmail: senderEmail,
      recipientEmail: thread.senderEmail,
      body: replyText,
      timestamp: new Date().toISOString(),
      isInbound: false,
    };

    thread.messages.push(newMsg);
    thread.lastActivityAt = newMsg.timestamp;
    thread.status = "follow_up_scheduled";
    this.threads.set(threadId, thread);

    return { success: true, message: newMsg };
  }

  /**
   * Updates lead interest/status.
   */
  public static updateStatus(threadId: string, status: ThreadStatus): boolean {
    const thread = this.getThreadById(threadId);
    if (!thread) return false;
    thread.status = status;
    thread.lastActivityAt = new Date().toISOString();
    this.threads.set(threadId, thread);
    return true;
  }

  /**
   * Appends internal team note to thread.
   */
  public static addNote(threadId: string, author: string, text: string): boolean {
    const thread = this.getThreadById(threadId);
    if (!thread) return false;
    thread.notes.push({
      id: `note-${Date.now()}`,
      author,
      text,
      createdAt: new Date().toISOString(),
    });
    this.threads.set(threadId, thread);
    return true;
  }

  /**
   * Suppresses contact directly from inbox.
   */
  public static suppressContact(threadId: string): { success: boolean; contactEmail: string } {
    const thread = this.getThreadById(threadId);
    if (!thread) return { success: false, contactEmail: "" };
    thread.status = "suppressed";
    this.threads.set(threadId, thread);
    return { success: true, contactEmail: thread.senderEmail };
  }

  private static seedSampleThreads() {
    const sample1: ThreadRecord = {
      id: "th-101",
      contactId: "cnt-1",
      senderName: "Vikram Sharma",
      senderEmail: "vikram.sharma@techcorp.in",
      senderCompany: "TechCorp India",
      campaignId: "cmp-001",
      campaignName: "AI Automation Outreach - Q4 Tier 1 Founders",
      subject: "Re: Accelerating TechCorp's workflows with AI automation",
      snippet: "Hi Vikram, thanks for reaching out. We are exploring AI automation for our backend data pipeline. What are your consultation rates?",
      sentiment: "positive",
      status: "interested",
      messages: [
        {
          id: "m-1",
          sender: "Vikram @ HENU OS",
          senderEmail: "vikram@henuos.com",
          recipientEmail: "vikram.sharma@techcorp.in",
          body: "Hi Vikram, our engineering team at HENU OS built an autonomous workflow engine that cuts latency by 60%. Would you be open to a brief chat?",
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          isInbound: false,
        },
        {
          id: "m-2",
          sender: "Vikram Sharma",
          senderEmail: "vikram.sharma@techcorp.in",
          recipientEmail: "vikram@henuos.com",
          body: "Hi Vikram, thanks for reaching out. We are exploring AI automation for our backend data pipeline. What are your consultation rates?",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          isInbound: true,
        },
      ],
      notes: [
        {
          id: "n-1",
          author: "Alex (Admin)",
          text: "Enterprise lead. 50+ engineers. High priority.",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      lastActivityAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    };

    const sample2: ThreadRecord = {
      id: "th-102",
      contactId: "cnt-2",
      senderName: "Ananya Patel",
      senderEmail: "ananya.patel@innovatestartup.com",
      senderCompany: "Innovate Health",
      campaignId: "cmp-002",
      campaignName: "Software Solutions - Startup Acceleration",
      subject: "Re: Scalable mobile & cloud infrastructure for Innovate Health",
      snippet: "Interested. Do you guys build in Flutter? Let's connect next Tuesday at 3 PM IST.",
      sentiment: "positive",
      status: "meeting_booked",
      messages: [
        {
          id: "m-3",
          sender: "HENU Dispatch",
          senderEmail: "outreach@henuos.com",
          recipientEmail: "ananya.patel@innovatestartup.com",
          body: "Hi Ananya, noticed Innovate Health is expanding its mobile telehealth stack.",
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          isInbound: false,
        },
        {
          id: "m-4",
          sender: "Ananya Patel",
          senderEmail: "ananya.patel@innovatestartup.com",
          recipientEmail: "outreach@henuos.com",
          body: "Interested. Do you guys build in Flutter? Let's connect next Tuesday at 3 PM IST.",
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          isInbound: true,
        },
      ],
      notes: [],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      lastActivityAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    };

    this.threads.set(sample1.id, sample1);
    this.threads.set(sample2.id, sample2);
  }
}
