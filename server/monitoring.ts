import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const SECRET_PATTERNS = [
  /sk_(?:live|test)_[A-Za-z0-9]+/g,
  /whsec_[A-Za-z0-9]+/g,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
  /key-[A-Za-z0-9]{32,}/g,
  /re_[A-Za-z0-9]{20,}/g,
  /password["']?\s*[:=]\s*["'][^"']+["']/gi,
];

export function scrubSecrets(input: string): string {
  let result = input;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

interface ErrorWindow {
  count: number;
  windowStart: number;
}

const errorTracker: ErrorWindow = { count: 0, windowStart: Date.now() };
const WINDOW_MS = 5 * 60 * 1000;
const ERROR_THRESHOLD = 20;
let lastAlertSent = 0;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

const webhookFailures: { timestamp: number; eventType: string; error: string }[] = [];
const MAX_WEBHOOK_FAILURES = 100;

function trackError(statusCode: number, method: string, path: string): void {
  const now = Date.now();
  if (now - errorTracker.windowStart > WINDOW_MS) {
    errorTracker.count = 0;
    errorTracker.windowStart = now;
  }
  if (statusCode >= 500) {
    errorTracker.count++;
    if (errorTracker.count >= ERROR_THRESHOLD && now - lastAlertSent > ALERT_COOLDOWN_MS) {
      lastAlertSent = now;
      sendErrorRateAlert(errorTracker.count, WINDOW_MS / 60000).catch(() => {});
    }
  }
}

export function trackWebhookFailure(eventType: string, error: string): void {
  const sanitizedError = scrubSecrets(error);
  webhookFailures.push({ timestamp: Date.now(), eventType, error: sanitizedError });
  if (webhookFailures.length > MAX_WEBHOOK_FAILURES) {
    webhookFailures.shift();
  }
  sendWebhookFailureAlert(eventType, sanitizedError).catch(() => {});
}

async function sendErrorRateAlert(count: number, windowMinutes: number): Promise<void> {
  try {
    const { getUncachableResendClient } = await import("./resend-client");
    const { client, fromEmail } = await getUncachableResendClient();
    const adminEmails = (process.env.ADMIN_EMAILS || "mindshareai@gmail.com").split(",").map(e => e.trim());
    const from = fromEmail || "Mindshare AI <noreply@mindshare-ai.com>";

    await client.emails.send({
      from,
      to: adminEmails,
      subject: `[ALERT] High 5xx Error Rate - ${count} errors in ${windowMinutes} min`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">High Error Rate Alert</h2>
          <p><strong>${count}</strong> server errors (5xx) detected in the last <strong>${windowMinutes} minutes</strong>.</p>
          <p>Threshold: ${ERROR_THRESHOLD} errors per ${WINDOW_MS / 60000} minute window.</p>
          <p style="color: #6b7280; font-size: 12px;">Time: ${new Date().toISOString()}</p>
          <p style="color: #6b7280; font-size: 12px;">This alert has a ${ALERT_COOLDOWN_MS / 60000} minute cooldown between sends.</p>
        </div>
      `,
    });
    console.log(`[monitoring] Error rate alert sent: ${count} errors in ${windowMinutes}min`);
  } catch (err) {
    console.error("[monitoring] Failed to send error rate alert:", err);
  }
}

async function sendWebhookFailureAlert(eventType: string, error: string): Promise<void> {
  try {
    const { getUncachableResendClient } = await import("./resend-client");
    const { client, fromEmail } = await getUncachableResendClient();
    const adminEmails = (process.env.ADMIN_EMAILS || "mindshareai@gmail.com").split(",").map(e => e.trim());
    const from = fromEmail || "Mindshare AI <noreply@mindshare-ai.com>";

    await client.emails.send({
      from,
      to: adminEmails,
      subject: `[ALERT] Stripe Webhook Failed - ${eventType}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Webhook Processing Failed</h2>
          <p><strong>Event Type:</strong> ${eventType}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p style="color: #6b7280; font-size: 12px;">Time: ${new Date().toISOString()}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="font-size: 13px;">Check your Stripe Dashboard for event details and retry if needed.</p>
        </div>
      `,
    });
    console.log(`[monitoring] Webhook failure alert sent for ${eventType}`);
  } catch (err) {
    console.error("[monitoring] Failed to send webhook failure alert:", err);
  }
}

export function auditLog(event: string, details: Record<string, unknown>): void {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (typeof value === "string") {
      sanitized[key] = scrubSecrets(value);
    } else {
      sanitized[key] = value;
    }
  }
  console.log(JSON.stringify({
    level: "audit",
    event,
    timestamp: new Date().toISOString(),
    ...sanitized,
  }));
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const requestId = crypto.randomUUID();
  (req as any).requestId = requestId;
  next();
}

export function monitoringMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const path = req.path;
  const requestId = (req as any).requestId || "unknown";
  const userId = (req as any).userId || "anonymous";

  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      trackError(res.statusCode, req.method, path);

      const logEntry: Record<string, unknown> = {
        level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
        requestId,
        method: req.method,
        path,
        statusCode: res.statusCode,
        durationMs: duration,
        userId,
        timestamp: new Date().toISOString(),
      };

      if (capturedJsonResponse) {
        const safeKeys = ["error", "message", "success", "received"];
        const summary: Record<string, unknown> = {};
        for (const key of safeKeys) {
          if (key in capturedJsonResponse) summary[key] = capturedJsonResponse[key];
        }
        if (Array.isArray(capturedJsonResponse)) {
          summary["count"] = capturedJsonResponse.length;
        }
        if (Object.keys(summary).length > 0) {
          logEntry.response = summary;
        }
      }

      console.log(scrubSecrets(JSON.stringify(logEntry)));
    }
  });

  next();
}

export function getMonitoringStats(): {
  errorRate: { count: number; windowMs: number; windowStart: string };
  recentWebhookFailures: typeof webhookFailures;
} {
  return {
    errorRate: {
      count: errorTracker.count,
      windowMs: WINDOW_MS,
      windowStart: new Date(errorTracker.windowStart).toISOString(),
    },
    recentWebhookFailures: webhookFailures.slice(-10),
  };
}
