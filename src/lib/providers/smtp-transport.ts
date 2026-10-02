/**
 * HENU MAIL - Direct SMTP Transport Layer (Nodemailer)
 * Supports Gmail App Passwords, Custom SMTP, TLS, and RFC-2822 formatting
 */

import nodemailer from "nodemailer";

export interface SmtpSendParams {
  host?: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface SmtpSendResult {
  success: boolean;
  messageId?: string;
  latencyMs?: number;
  error?: string;
}

export class SmtpTransportService {
  /**
   * Dispatches email via direct SMTP transport
   */
  public static async send(params: SmtpSendParams): Promise<SmtpSendResult> {
    const startTime = Date.now();
    try {
      const isGmail = params.fromEmail.endsWith("@gmail.com") || (params.host && params.host.includes("gmail"));
      const host = params.host || (isGmail ? "smtp.gmail.com" : "smtp.gmail.com");
      const port = params.port || (isGmail ? 465 : 587);
      const secure = params.secure !== undefined ? params.secure : port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: params.user.trim(),
          pass: params.pass.replace(/\s+/g, ""), // strip any spaces in app password
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: `"${params.fromName || "HENU OS"}" <${params.fromEmail}>`,
        to: params.toEmail,
        subject: params.subject,
        html: params.htmlContent,
        text: params.textContent || params.htmlContent.replace(/<[^>]+>/g, " "),
      });

      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        messageId: info.messageId,
        latencyMs,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : "SMTP transport error";
      return {
        success: false,
        latencyMs,
        error: errorMsg,
      };
    }
  }

  /**
   * Health-checks SMTP connection credentials
   */
  public static async verifyConnection(user: string, pass: string, host = "smtp.gmail.com", port = 465): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: user.trim(),
          pass: pass.replace(/\s+/g, ""),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Connection verification failed",
      };
    }
  }
}
